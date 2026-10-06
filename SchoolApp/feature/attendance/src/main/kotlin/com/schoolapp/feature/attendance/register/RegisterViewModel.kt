package com.schoolapp.feature.attendance.register

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.model.attendance.AttendanceRegister
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

/** One section's register for one date: tap-to-mark roster, draft/submit with offline queueing and conflicts. */
@HiltViewModel
class RegisterViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: AttendanceRepository,
    private val healthRepository: HealthRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val sectionId: String = checkNotNull(savedStateHandle["sectionId"]) { "Section id missing" }
    private val date: String = checkNotNull(savedStateHandle["date"]) { "Date missing" }

    private val _uiState = MutableStateFlow(RegisterUiState(title = savedStateHandle["title"] ?: "", date = date))
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            repository.syncState(sectionId, date).collect { sync -> _uiState.update { it.copy(syncState = sync) } }
        }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.register == null, error = null) }
        viewModelScope.launch {
            val permissions = RegisterPermissions.of(authRepository.session.filterNotNull().first())
            _uiState.update {
                it.copy(
                    isHelper = permissions.isHelper,
                    canEdit = permissions.canEdit,
                    canSubmit = permissions.canSubmit,
                    canRequestCorrection = permissions.canRequestCorrection,
                )
            }
            val alerts = async { healthRepository.alerts(sectionId) }
            when (val result = repository.register(sectionId, date)) {
                is AppResult.Success -> applyLoaded(result.data)
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
            val alertList = (alerts.await() as? AppResult.Success)?.data.orEmpty()
            _uiState.update { it.copy(alerts = alertList.associateBy { alert -> alert.studentId }) }
        }
    }

    /** Row tap: cycles the mark (unmarked starts at present); on a locked register it opens a correction. */
    fun onRowTap(studentId: String) {
        val state = _uiState.value
        if (state.isReadOnly) {
            if (state.status == RegisterStatus.LOCKED && state.canRequestCorrection) openCorrection(studentId)
            return
        }
        val next = state.marks[studentId]?.next() ?: AttendanceStatus.PRESENT
        setMark(studentId, next)
    }

    fun onStatusSelected(studentId: String, status: AttendanceStatus) {
        if (_uiState.value.isReadOnly) return
        setMark(studentId, status)
    }

    /** Every student not on approved leave becomes present. */
    fun markAllPresent() {
        val state = _uiState.value
        if (state.isReadOnly) return
        val entries = state.register?.entries.orEmpty()
        val marks = state.marks + entries.filterNot { it.onLeave }.associate { it.studentId to AttendanceStatus.PRESENT }
        _uiState.update { it.copy(marks = marks, hasUnsentChanges = true, unmarkedBlocking = null, message = null) }
    }

    fun saveDraft() = perform(RegisterAction.DRAFT)

    fun onSubmitClick() {
        val state = _uiState.value
        if (!state.showSubmit || state.isReadOnly || state.busyAction != null) return
        val unmarked = state.counts.unmarked
        _uiState.update {
            if (unmarked > 0) it.copy(unmarkedBlocking = unmarked) else it.copy(unmarkedBlocking = null, confirmSubmit = true)
        }
    }

    fun onConfirmSubmit() {
        _uiState.update { it.copy(confirmSubmit = false) }
        perform(RegisterAction.SUBMIT)
    }

    fun onDismissConfirm() = _uiState.update { it.copy(confirmSubmit = false) }

    fun onToggleCompare() = _uiState.update { state ->
        state.copy(conflict = state.conflict?.let { it.copy(comparing = !it.comparing) })
    }

    /** Drops this device's unsent marks (conflict or rejected outbox) and shows the server register. */
    fun discardLocalMarks() {
        viewModelScope.launch {
            repository.discardLocal(sectionId, date)
            _uiState.update { it.copy(conflict = null, hasUnsentChanges = false, pendingAttempt = null, actionError = null) }
            load()
        }
    }

    fun onAlertClick(studentId: String) = _uiState.update { it.copy(alertSheet = it.alerts[studentId]) }

    fun onDismissAlert() = _uiState.update { it.copy(alertSheet = null) }

    fun onCorrectionStatus(status: AttendanceStatus) = editCorrection { it.copy(newStatus = status, statusMissing = false) }

    fun onCorrectionReason(reason: String) = editCorrection { it.copy(reason = reason, reasonMissing = false) }

    fun onDismissCorrection() {
        if (_uiState.value.correction?.isSaving == true) return
        _uiState.update { it.copy(correction = null) }
    }

    fun submitCorrection() {
        val editor = _uiState.value.correction ?: return
        if (editor.isSaving) return
        val newStatus = editor.newStatus?.takeIf { it != editor.current }
        if (newStatus == null || editor.reason.isBlank()) {
            editCorrection { it.copy(statusMissing = newStatus == null, reasonMissing = it.reason.isBlank()) }
            return
        }
        editCorrection { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.requestCorrection(editor.entryId, newStatus, editor.reason.trim())) {
                is AppResult.Failure -> editCorrection { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> _uiState.update { it.copy(correction = null, message = RegisterMessage.CORRECTION_SENT) }
            }
        }
    }

    private fun openCorrection(studentId: String) {
        val entry = _uiState.value.register?.entries?.firstOrNull { it.studentId == studentId } ?: return
        val entryId = entry.entryId ?: return
        _uiState.update {
            it.copy(correction = CorrectionEditor(entryId, entry.name, it.marks[studentId]), message = null)
        }
    }

    private fun setMark(studentId: String, status: AttendanceStatus) = _uiState.update {
        it.copy(marks = it.marks + (studentId to status), hasUnsentChanges = true, unmarkedBlocking = null, message = null)
    }

    private fun perform(action: RegisterAction) {
        val state = _uiState.value
        val register = state.register ?: return
        if (state.busyAction != null || state.isReadOnly) return
        if (action == RegisterAction.SUBMIT && !state.showSubmit) return
        val marks = state.marks
        val attempt = state.pendingAttempt?.takeIf { it.action == action && it.marks == marks }
            ?: PendingAttempt(action, UUID.randomUUID().toString(), marks)
        _uiState.update { it.copy(busyAction = action, pendingAttempt = attempt, actionError = null, message = null, unmarkedBlocking = null) }
        val entryMarks = register.entries.mapNotNull { entry -> marks[entry.studentId]?.let { EntryMark(entry.studentId, it, entry.remark) } }
        viewModelScope.launch {
            val result = when (action) {
                RegisterAction.DRAFT -> repository.saveDraft(sectionId, date, entryMarks, attempt.clientRequestId)
                RegisterAction.SUBMIT -> repository.submit(sectionId, date, entryMarks, attempt.clientRequestId)
            }
            when (result) {
                is AppResult.Failure -> _uiState.update { it.copy(busyAction = null, actionError = result.error) }
                is AppResult.Success -> onOutcome(action, marks, result.data)
            }
        }
    }

    private fun onOutcome(action: RegisterAction, sent: Map<String, AttendanceStatus>, outcome: RegisterOutcome) = _uiState.update { state ->
        val done = state.copy(busyAction = null, pendingAttempt = null)
        when (outcome) {
            is RegisterOutcome.Saved -> done.copy(
                register = outcome.register,
                marks = serverMarks(outcome.register),
                hasUnsentChanges = false,
                offline = false,
                message = if (action == RegisterAction.DRAFT) RegisterMessage.DRAFT_SAVED else RegisterMessage.SUBMITTED,
            )
            RegisterOutcome.Queued -> done.copy(hasUnsentChanges = true, message = RegisterMessage.QUEUED)
            is RegisterOutcome.PendingReview -> done.copy(
                register = done.register?.copy(status = RegisterStatus.PENDING_REVIEW),
                hasUnsentChanges = false,
                message = RegisterMessage.PENDING_REVIEW,
            )
            is RegisterOutcome.AlreadySubmitted -> {
                val current = outcome.current
                done.copy(
                    register = current ?: done.register?.copy(status = RegisterStatus.SUBMITTED),
                    marks = current?.let(::serverMarks) ?: done.marks,
                    conflict = RegisterConflict(submittedBy = current?.submittedBy?.name, myMarks = sent),
                )
            }
            RegisterOutcome.Locked -> done.copy(
                register = done.register?.copy(status = RegisterStatus.LOCKED),
                message = RegisterMessage.LOCKED,
            )
        }
    }

    private fun applyLoaded(loaded: LoadedRegister) = _uiState.update {
        val local = loaded.localMarks
        it.copy(
            isLoading = false,
            register = loaded.register,
            marks = local?.associate { mark -> mark.studentId to mark.status } ?: serverMarks(loaded.register),
            hasUnsentChanges = local != null,
            offline = loaded.offline,
        )
    }

    private fun editCorrection(transform: (CorrectionEditor) -> CorrectionEditor) =
        _uiState.update { state -> state.copy(correction = state.correction?.let(transform)) }

    private companion object {
        /** Server statuses, with approved leave prefilled as LEAVE. */
        fun serverMarks(register: AttendanceRegister): Map<String, AttendanceStatus> = register.entries.mapNotNull { entry ->
            (entry.status ?: AttendanceStatus.LEAVE.takeIf { entry.onLeave })?.let { entry.studentId to it }
        }.toMap()
    }
}
