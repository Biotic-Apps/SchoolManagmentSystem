package com.schoolapp.feature.exams.entry

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.model.exams.LoadedMarkSheet
import com.schoolapp.core.model.exams.MarkSheetOutcome
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.feature.exams.ExamPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

/** One mark sheet: fast marks entry, absent toggles, draft/submit with offline queueing. */
@HiltViewModel
class MarksEntryViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val sheetId: String = checkNotNull(savedStateHandle["sheetId"]) { "Sheet id missing" }

    private val _uiState = MutableStateFlow(MarksEntryUiState(title = savedStateHandle["title"] ?: ""))
    val uiState: StateFlow<MarksEntryUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            repository.syncState(sheetId).collect { sync -> _uiState.update { it.copy(syncState = sync) } }
        }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.sheet == null, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canEdit = ExamPermissions.canEdit(session), canSubmit = ExamPermissions.canSubmit(session)) }
            when (val result = repository.markSheet(sheetId)) {
                is AppResult.Success -> applyLoaded(result.data)
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun onMarksChange(studentId: String, text: String) = edit(studentId) { it.copy(text = MarksValidation.sanitize(text)) }

    /** Absent clears the marks; un-marking absent leaves the row pending until marks are typed. */
    fun onAbsentChange(studentId: String, absent: Boolean) = edit(studentId) { it.copy(absent = absent, text = "") }

    fun saveDraft() = perform(MarksAction.DRAFT)

    fun onSubmitClick() {
        val state = _uiState.value
        if (!state.canSubmit || state.isReadOnly || state.busyAction != null) return
        val counts = state.counts
        _uiState.update {
            when {
                counts.invalid > 0 -> it.copy(invalidBlocking = true, scrollToStudentId = firstInvalid(it))
                counts.pending > 0 -> it.copy(
                    pendingBlocking = counts.pending,
                    scrollToStudentId = it.rows.firstOrNull { row -> row.isPending }?.studentId,
                )
                else -> it.copy(pendingBlocking = null, invalidBlocking = false, confirmSubmit = true)
            }
        }
    }

    fun onConfirmSubmit() {
        _uiState.update { it.copy(confirmSubmit = false) }
        perform(MarksAction.SUBMIT)
    }

    fun onDismissConfirm() = _uiState.update { it.copy(confirmSubmit = false) }

    fun onScrollHandled() = _uiState.update { it.copy(scrollToStudentId = null) }

    /** Drops this device's unsent marks of the sheet and reloads the server copy. */
    fun discardLocal() {
        viewModelScope.launch {
            repository.discardLocal(sheetId)
            _uiState.update {
                it.copy(hasUnsentChanges = false, pendingAttempt = null, actionError = null, message = null, pendingBlocking = null)
            }
            load()
        }
    }

    private fun edit(studentId: String, transform: (MarkInput) -> MarkInput) {
        if (_uiState.value.isReadOnly) return
        _uiState.update {
            val current = it.inputs[studentId] ?: MarkInput()
            it.copy(
                inputs = it.inputs + (studentId to transform(current)),
                hasUnsentChanges = true,
                pendingBlocking = null,
                invalidBlocking = false,
                message = null,
            )
        }
    }

    private fun perform(action: MarksAction) {
        val state = _uiState.value
        if (state.sheet == null || state.busyAction != null || state.isReadOnly) return
        if (action == MarksAction.SUBMIT && !state.canSubmit) return
        if (state.counts.invalid > 0) {
            _uiState.update { it.copy(invalidBlocking = true, scrollToStudentId = firstInvalid(it)) }
            return
        }
        val entries = state.entries()
        val attempt = state.pendingAttempt?.takeIf { it.action == action && it.entries == entries }
            ?: PendingAttempt(action, UUID.randomUUID().toString(), entries)
        _uiState.update {
            it.copy(busyAction = action, pendingAttempt = attempt, actionError = null, message = null, pendingBlocking = null, invalidBlocking = false)
        }
        viewModelScope.launch {
            val result = when (action) {
                MarksAction.DRAFT -> repository.saveMarks(sheetId, entries, attempt.clientRequestId)
                MarksAction.SUBMIT -> repository.submit(sheetId, entries, attempt.clientRequestId)
            }
            when (result) {
                is AppResult.Failure -> _uiState.update { it.copy(busyAction = null, actionError = result.error) }
                is AppResult.Success -> onOutcome(action, result.data)
            }
        }
    }

    private fun onOutcome(action: MarksAction, outcome: MarkSheetOutcome) = _uiState.update { state ->
        val done = state.copy(busyAction = null, pendingAttempt = null)
        when (outcome) {
            is MarkSheetOutcome.Saved -> done.copy(
                sheet = outcome.sheet,
                inputs = MarksEntryUiState.inputsOf(outcome.sheet),
                hasUnsentChanges = false,
                offline = false,
                message = if (action == MarksAction.DRAFT) MarksMessage.DRAFT_SAVED else MarksMessage.SUBMITTED,
            )
            MarkSheetOutcome.Queued -> done.copy(hasUnsentChanges = true, message = MarksMessage.QUEUED)
            is MarkSheetOutcome.PendingReview -> done.copy(
                sheet = done.sheet?.copy(status = MarkSheetStatus.PENDING_REVIEW),
                hasUnsentChanges = false,
                message = MarksMessage.PENDING_REVIEW,
            )
        }
    }

    private fun applyLoaded(loaded: LoadedMarkSheet) = _uiState.update {
        it.copy(
            isLoading = false,
            sheet = loaded.sheet,
            inputs = MarksEntryUiState.inputsOf(loaded.sheet),
            hasUnsentChanges = loaded.localEntries != null,
            offline = loaded.offline,
        )
    }

    private fun firstInvalid(state: MarksEntryUiState): String? = state.rows.firstOrNull { it.error != null }?.studentId
}
