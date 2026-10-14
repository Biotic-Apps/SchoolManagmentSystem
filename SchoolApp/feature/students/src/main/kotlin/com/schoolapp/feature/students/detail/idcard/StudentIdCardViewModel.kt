package com.schoolapp.feature.students.detail.idcard

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.idcards.StudentIdCardRepository
import com.schoolapp.core.model.idcards.StudentIdCard
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

internal enum class IdCardNotice { QUEUED, READY }

@Immutable
internal data class StudentIdCardUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    /** Null once loaded = no card generated yet. */
    val card: StudentIdCard? = null,
    val error: AppError? = null,
    val isGenerating: Boolean = false,
    val isOpening: Boolean = false,
    val actionError: AppError? = null,
    val notice: IdCardNotice? = null,
    val openUrl: String? = null,
) {
    val isPending: Boolean get() = card?.status == IdCardStatus.PENDING || isGenerating
    val isReady: Boolean get() = card?.status == IdCardStatus.READY && card.fileUrl != null
    val isFailed: Boolean get() = card?.status == IdCardStatus.FAILED
}

/** Student ID card (staff tab and parent child profile); polls every 2 s while a card renders and is on screen. */
@HiltViewModel
internal class StudentIdCardViewModel @Inject constructor(
    private val repository: StudentIdCardRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentIdCardUiState())
    val uiState: StateFlow<StudentIdCardUiState> = _uiState.asStateFlow()

    private var studentId: String? = null
    private var loadJob: Job? = null
    private var pollJob: Job? = null
    private var visible = false

    /** Binds the student; a different id (parent switched child) starts over. */
    fun start(id: String) {
        if (studentId == id) return
        studentId = id
        pollJob?.cancel()
        _uiState.value = StudentIdCardUiState()
        load()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun setVisible(value: Boolean) {
        visible = value
        if (value) maybePoll() else pollJob?.cancel()
    }

    fun generate() {
        val id = studentId ?: return
        if (_uiState.value.isPending) return
        _uiState.update { it.copy(isGenerating = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.generate(id)) {
                is AppResult.Failure -> _uiState.update { it.copy(isGenerating = false, actionError = result.error) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(notice = IdCardNotice.QUEUED) }
                    fetch()
                    _uiState.update { it.copy(isGenerating = false) }
                    maybePoll()
                }
            }
        }
    }

    /** Re-reads the card so the opened link is freshly signed. */
    fun download() {
        val id = studentId ?: return
        if (_uiState.value.isOpening) return
        _uiState.update { it.copy(isOpening = true, actionError = null) }
        viewModelScope.launch {
            val result = repository.card(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Failure -> state.copy(isOpening = false, actionError = result.error)
                    is AppResult.Success -> state.copy(isOpening = false, card = result.data, openUrl = result.data?.fileUrl)
                }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(openUrl = null) }

    fun consumeNotice() = _uiState.update { it.copy(notice = null) }

    fun consumeActionError() = _uiState.update { it.copy(actionError = null) }

    private fun load() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            fetch()
            maybePoll()
        }
    }

    /** [quiet] (polling): a failed tick keeps the current state; the next tick retries. */
    private suspend fun fetch(quiet: Boolean = false) {
        val id = studentId ?: return
        val result = repository.card(id)
        if (id != studentId) return
        _uiState.update { state ->
            when (result) {
                is AppResult.Success -> state.copy(
                    isLoading = false, isRefreshing = false, error = null, card = result.data,
                    notice = if (state.card.pending() && result.data?.status == IdCardStatus.READY) IdCardNotice.READY else state.notice,
                )
                is AppResult.Failure -> when {
                    quiet -> state
                    state.isLoading || state.card == null -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                    else -> state.copy(isRefreshing = false, actionError = result.error)
                }
            }
        }
    }

    private fun maybePoll() {
        if (!visible || pollJob?.isActive == true || !_uiState.value.card.pending()) return
        pollJob = viewModelScope.launch {
            while (_uiState.value.card.pending()) {
                delay(POLL_MS)
                fetch(quiet = true)
            }
        }
    }

    private fun StudentIdCard?.pending() = this?.status == IdCardStatus.PENDING

    private companion object {
        const val POLL_MS = 2_000L
    }
}
