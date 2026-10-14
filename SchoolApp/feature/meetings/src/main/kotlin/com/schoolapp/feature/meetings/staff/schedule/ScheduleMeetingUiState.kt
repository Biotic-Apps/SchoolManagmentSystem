package com.schoolapp.feature.meetings.staff.schedule

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.meetings.domain.MeetingTimeDraft
import com.schoolapp.feature.meetings.domain.MeetingTimeProblem

/** Staff "Schedule meeting": student, one of their verified guardians, time, mode, agenda. */
@Immutable
data class ScheduleMeetingUiState(
    val today: String = "",
    val query: String = "",
    val isSearching: Boolean = false,
    val results: List<StudentSummary> = emptyList(),
    val searchError: AppError? = null,
    val student: StudentSummary? = null,
    /** VERIFIED guardian links of [student]. */
    val guardians: List<GuardianLink> = emptyList(),
    val isLoadingGuardians: Boolean = false,
    val guardiansError: AppError? = null,
    /** Guardian record id. */
    val guardianId: String? = null,
    val time: MeetingTimeDraft = MeetingTimeDraft(date = ""),
    val timeProblems: Set<MeetingTimeProblem> = emptySet(),
    val agenda: String = "",
    val studentMissing: Boolean = false,
    val guardianMissing: Boolean = false,
    val agendaError: AgendaError? = null,
    val isSubmitting: Boolean = false,
    val error: AppError? = null,
    /** Set once the server created the meeting; the route leaves and clears it. */
    val createdId: String? = null,
)

enum class AgendaError { MISSING, TOO_LONG }
