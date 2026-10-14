package com.schoolapp.feature.meetings.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.feature.meetings.domain.CompleteErrors
import com.schoolapp.feature.meetings.domain.CompleteMeetingForm
import com.schoolapp.feature.meetings.domain.MeetingTimeDraft
import com.schoolapp.feature.meetings.domain.MeetingTimeProblem

enum class MeetingAction { COMPLETE, NO_SHOW, CANCEL, ACCEPT, DECLINE }

@Immutable
data class MeetingDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val notFound: Boolean = false,
    val meeting: Meeting? = null,
    val isStaffViewer: Boolean = false,
    val today: String = "",
    /** Staff on a SCHEDULED meeting: complete, no-show, cancel. */
    val canAct: Boolean = false,
    /** Staff on a parent's REQUESTED meeting: accept or decline. */
    val canAnswer: Boolean = false,
    /** The cancel sheet declines a request instead of cancelling a meeting. */
    val declining: Boolean = false,
    /** Non-null while the complete sheet is open. */
    val completeForm: CompleteMeetingForm? = null,
    val completeErrors: CompleteErrors = CompleteErrors(),
    val cancelOpen: Boolean = false,
    val cancelReason: String = "",
    val confirmNoShow: Boolean = false,
    /** Non-null while the "accept at another time" sheet is open. */
    val acceptDraft: MeetingTimeDraft? = null,
    val acceptProblems: Set<MeetingTimeProblem> = emptySet(),
    val busy: MeetingAction? = null,
    val actionError: AppError? = null,
    /** Last finished action, shown as a success message. */
    val done: MeetingAction? = null,
)
