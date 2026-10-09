package com.schoolapp.feature.meetings.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.feature.meetings.domain.CompleteErrors
import com.schoolapp.feature.meetings.domain.CompleteMeetingForm
import com.schoolapp.feature.meetings.domain.CompleteValidation
import com.schoolapp.feature.meetings.domain.FollowUpDraft
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * One meeting for staff; SCHEDULED meetings can be completed (notes, summary, follow-ups), marked no-show or
 * cancelled, and a parent's REQUESTED meeting accepted (at the suggested time) or declined.
 */
@HiltViewModel
class MeetingDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: MeetingsRepository,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val meetingId: String = checkNotNull(savedStateHandle["meetingId"]) { "Meeting id missing" }
    private val box: MeetingBox = enumOrDefault(savedStateHandle.get<String>("box"), MeetingBox.UPCOMING)
    private var nextFollowUpKey = 0

    private val _uiState = MutableStateFlow(MeetingDetailUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<MeetingDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    /** There is no single-meeting endpoint: look in the box it was opened from, then the other one. */
    fun load() {
        _uiState.update { it.copy(isLoading = it.meeting == null, error = null) }
        viewModelScope.launch {
            val isStaff = authRepository.session.filterNotNull().first().activeRole != RoleKey.PARENT
            val other = if (box == MeetingBox.UPCOMING) MeetingBox.PAST else MeetingBox.UPCOMING
            var found: Meeting? = null
            for (candidate in listOf(box, other)) {
                when (val result = repository.meetings(candidate)) {
                    is AppResult.Failure -> {
                        _uiState.update { it.copy(isLoading = false, error = result.error) }
                        return@launch
                    }
                    is AppResult.Success -> found = result.data.firstOrNull { it.id == meetingId }
                }
                if (found != null) break
            }
            _uiState.update { it.copy(isLoading = false, notFound = found == null, isStaffViewer = isStaff).withMeeting(found) }
        }
    }

    fun openComplete() = _uiState.update {
        if (!it.canAct) it else it.copy(completeForm = CompleteMeetingForm(), completeErrors = CompleteErrors(), actionError = null, done = null)
    }

    fun dismissComplete() = _uiState.update { if (it.busy == MeetingAction.COMPLETE) it else it.copy(completeForm = null) }

    fun onNotesChange(value: String) = editForm { it.copy(notes = value) }
    fun onShareSummaryChange(value: Boolean) = editForm { it.copy(shareSummary = value) }
    fun onSummaryChange(value: String) = editForm { it.copy(summary = value) }
    fun addFollowUp() = editForm { it.copy(followUps = it.followUps + FollowUpDraft(key = nextFollowUpKey++)) }
    fun removeFollowUp(key: Int) = editForm { form -> form.copy(followUps = form.followUps.filterNot { it.key == key }) }
    fun onFollowUpTitleChange(key: Int, value: String) = editFollowUp(key) { it.copy(title = value) }
    fun onFollowUpDateChange(key: Int, value: String) = editFollowUp(key) { it.copy(dueDate = value) }

    fun submitComplete() {
        val state = _uiState.value
        val form = state.completeForm ?: return
        if (state.busy != null) return
        val errors = CompleteValidation.validate(form)
        _uiState.update { it.copy(completeErrors = errors) }
        if (!errors.isEmpty) return
        perform(MeetingAction.COMPLETE) { repository.complete(meetingId, form.toInput()) }
    }

    fun openCancel() = _uiState.update {
        if (!it.canAct) it else it.copy(cancelOpen = true, declining = false, cancelReason = "", actionError = null, done = null)
    }

    fun openDecline() = _uiState.update {
        if (!it.canAnswer) it else it.copy(cancelOpen = true, declining = true, cancelReason = "", actionError = null, done = null)
    }

    fun dismissCancel() = _uiState.update {
        if (it.busy == MeetingAction.CANCEL || it.busy == MeetingAction.DECLINE) it else it.copy(cancelOpen = false)
    }

    fun onCancelReasonChange(value: String) = _uiState.update { it.copy(cancelReason = value) }

    fun submitCancel() {
        val reason = _uiState.value.cancelReason.trim().ifEmpty { null }
        if (_uiState.value.declining) {
            perform(MeetingAction.DECLINE) { repository.decline(meetingId, reason) }
        } else {
            perform(MeetingAction.CANCEL) { repository.cancel(meetingId, reason) }
        }
    }

    fun accept() = perform(MeetingAction.ACCEPT) { repository.accept(meetingId) }

    fun askNoShow() = _uiState.update { if (!it.canAct) it else it.copy(confirmNoShow = true, actionError = null, done = null) }
    fun dismissNoShow() = _uiState.update { it.copy(confirmNoShow = false) }

    fun confirmNoShow() {
        _uiState.update { it.copy(confirmNoShow = false) }
        perform(MeetingAction.NO_SHOW) { repository.markNoShow(meetingId) }
    }

    private fun perform(action: MeetingAction, call: suspend () -> AppResult<Meeting>) {
        val answering = action == MeetingAction.ACCEPT || action == MeetingAction.DECLINE
        val allowed = if (answering) _uiState.value.canAnswer else _uiState.value.canAct
        if (_uiState.value.busy != null || !allowed) return
        _uiState.update { it.copy(busy = action, actionError = null) }
        viewModelScope.launch {
            when (val result = call()) {
                is AppResult.Failure -> _uiState.update { it.copy(busy = null, actionError = result.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(busy = null, completeForm = null, cancelOpen = false, done = action).withMeeting(result.data)
                }
            }
        }
    }

    private fun editFollowUp(key: Int, transform: (FollowUpDraft) -> FollowUpDraft) =
        editForm { form -> form.copy(followUps = form.followUps.map { if (it.key == key) transform(it) else it }) }

    private fun editForm(transform: (CompleteMeetingForm) -> CompleteMeetingForm) = _uiState.update { state ->
        val form = state.completeForm?.let(transform) ?: return@update state
        val errors = if (state.completeErrors.isEmpty) state.completeErrors else CompleteValidation.validate(form)
        state.copy(completeForm = form, completeErrors = errors)
    }

    private fun MeetingDetailUiState.withMeeting(meeting: Meeting?) = copy(
        meeting = meeting,
        canAct = isStaffViewer && meeting?.status == MeetingStatus.SCHEDULED,
        canAnswer = isStaffViewer && meeting?.status == MeetingStatus.REQUESTED,
    )
}
