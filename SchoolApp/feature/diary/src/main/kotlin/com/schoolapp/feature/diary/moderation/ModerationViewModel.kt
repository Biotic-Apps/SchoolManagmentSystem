package com.schoolapp.feature.diary.moderation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.diary.supervisor.ReturnEditor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Branch moderation queue (`GET /diary?status=SUBMITTED&branchId=`) with publish and return actions. */
@HiltViewModel
class ModerationViewModel @Inject constructor(
    private val diaryRepository: DiaryRepository,
    private val organisationRepository: OrganisationRepository,
    private val authRepository: AuthRepository,
    private val publisher: SubmittedEntryPublisher,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ModerationUiState())
    val uiState: StateFlow<ModerationUiState> = _uiState.asStateFlow()
    private val _events = Channel<ModerationEvent>(Channel.BUFFERED)
    val events: Flow<ModerationEvent> = _events.receiveAsFlow()
    private var loadJob: Job? = null

    init {
        start()
    }

    private fun start() {
        viewModelScope.launch {
            val fixed = authRepository.session.first()?.activeBranchId
            if (fixed != null) {
                _uiState.update { it.copy(branchId = fixed) }
                return@launch load()
            }
            when (val result = organisationRepository.branches()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val branches = result.data
                    _uiState.update { it.copy(branches = branches.takeIf { list -> list.size > 1 }.orEmpty(), branchId = branches.firstOrNull()?.id) }
                    load()
                }
            }
        }
    }

    fun load(refresh: Boolean = false) {
        val state = _uiState.value
        if (state.branchId == null && state.branches.isEmpty() && state.error != null) return start()
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = !refresh || it.entries.isEmpty(), isRefreshing = refresh && it.entries.isNotEmpty(), error = null) }
        loadJob = viewModelScope.launch {
            val result = diaryRepository.moderationQueue(_uiState.value.branchId)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(isLoading = false, isRefreshing = false, entries = result.data)
                    is AppResult.Failure -> current.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    fun onBranchSelected(branchId: String) {
        if (branchId == _uiState.value.branchId) return
        _uiState.update { it.copy(branchId = branchId, entries = emptyList()) }
        load()
    }

    fun publish(entryId: String) {
        val entry = _uiState.value.entries.firstOrNull { it.id == entryId } ?: return
        if (_uiState.value.publishingId != null) return
        _uiState.update { it.copy(publishingId = entryId) }
        viewModelScope.launch {
            when (val result = publisher.publish(entry)) {
                is AppResult.Success -> {
                    _uiState.update { state -> state.copy(publishingId = null, entries = state.entries.filterNot { it.id == entryId }) }
                    _events.send(ModerationEvent.Published)
                }
                is AppResult.Failure -> {
                    _uiState.update { it.copy(publishingId = null) }
                    _events.send(ModerationEvent.Failed(result.error))
                }
            }
        }
    }

    fun onReturnClick(entryId: String) {
        val entry = _uiState.value.entries.firstOrNull { it.id == entryId } ?: return
        _uiState.update { it.copy(returnEditor = ReturnEditor(entry.id, entry.subjectName)) }
    }

    fun onReturnCommentChange(value: String) = editReturn { it.copy(comment = value, commentMissing = false) }

    fun onDismissReturn() {
        if (_uiState.value.returnEditor?.isSaving == true) return
        _uiState.update { it.copy(returnEditor = null) }
    }

    fun submitReturn() {
        val editor = _uiState.value.returnEditor ?: return
        if (editor.isSaving) return
        if (editor.comment.isBlank()) return editReturn { it.copy(commentMissing = true) }
        editReturn { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = diaryRepository.returnEntry(editor.entryId, editor.comment.trim())) {
                is AppResult.Failure -> editReturn { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    _uiState.update { state -> state.copy(returnEditor = null, entries = state.entries.filterNot { it.id == editor.entryId }) }
                    _events.send(ModerationEvent.Returned)
                }
            }
        }
    }

    private fun editReturn(transform: (ReturnEditor) -> ReturnEditor) =
        _uiState.update { state -> state.copy(returnEditor = state.returnEditor?.let(transform)) }
}
