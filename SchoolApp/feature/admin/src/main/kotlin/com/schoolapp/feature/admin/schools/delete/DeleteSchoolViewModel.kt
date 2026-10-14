package com.schoolapp.feature.admin.schools.delete

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.core.model.schools.SchoolDeletionState
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Permanent delete: shows what goes, asks for the school code, then follows the background job until it ends. */
@HiltViewModel
class DeleteSchoolViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: SchoolsRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val schoolId: String = checkNotNull(savedStateHandle["schoolId"])
    private val _uiState = MutableStateFlow(DeleteSchoolUiState())
    val uiState: StateFlow<DeleteSchoolUiState> = _uiState.asStateFlow()
    private var pollJob: Job? = null

    init {
        loadPreview()
    }

    fun loadPreview() {
        _uiState.update { it.copy(isLoading = true, previewError = null) }
        viewModelScope.launch {
            when (val result = repository.deletionPreview(schoolId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, preview = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, previewError = result.error) }
            }
        }
    }

    fun onConfirmTextChange(text: String) = _uiState.update { it.copy(confirmText = text, requestError = null) }

    fun delete() {
        val state = _uiState.value
        if (state.isRunning || !state.matches) return
        // A retry after a failure must not read the old run's state.
        _uiState.update { it.copy(isRunning = true, requestError = null, failed = false, failureDetail = null) }
        pollJob?.cancel()
        pollJob = viewModelScope.launch {
            when (val result = repository.requestDeletion(schoolId, state.confirmText.trim())) {
                is AppResult.Failure -> _uiState.update { it.copy(isRunning = false, requestError = result.error) }
                is AppResult.Success -> follow(result.data.state, result.data.error)
            }
        }
    }

    private suspend fun follow(initial: SchoolDeletionState, initialError: String?) {
        var state = initial
        var error = initialError
        while (state != SchoolDeletionState.DELETED && state != SchoolDeletionState.FAILED) {
            delay(POLL_MS)
            // A network blip while polling is not a failure: keep polling.
            val status = (repository.deletionStatus(schoolId) as? AppResult.Success)?.data ?: continue
            state = status.state
            error = status.error
        }
        if (state == SchoolDeletionState.DELETED) {
            repository.notifyChanged()
            notices.post(AdminNotice(AdminNotice.Kind.SCHOOL_DELETED, _uiState.value.preview?.name.orEmpty()))
            _uiState.update { it.copy(isRunning = false, deleted = true) }
        } else {
            _uiState.update { it.copy(isRunning = false, failed = true, failureDetail = error) }
        }
    }

    private companion object {
        const val POLL_MS = 1_000L
    }
}
