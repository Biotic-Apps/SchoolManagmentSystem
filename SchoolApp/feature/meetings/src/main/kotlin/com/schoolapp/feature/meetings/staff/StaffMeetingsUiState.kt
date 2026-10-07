package com.schoolapp.feature.meetings.staff

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.Meeting

/** Tab order matches web; [SLOTS] only shows for staff who can publish slots. */
enum class StaffMeetingsTab { UPCOMING, PAST, SLOTS, FOLLOW_UPS }

internal fun visibleStaffTabs(canPublishSlots: Boolean): List<StaffMeetingsTab> =
    StaffMeetingsTab.entries.filter { it != StaffMeetingsTab.SLOTS || canPublishSlots }

@Immutable
data class StaffMeetingsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val tab: StaffMeetingsTab = StaffMeetingsTab.UPCOMING,
    val upcoming: List<Meeting> = emptyList(),
    val past: List<Meeting> = emptyList(),
    /** OPEN follow-ups owned by the caller. */
    val followUps: List<FollowUp> = emptyList(),
    val today: String = "",
    val busyFollowUpIds: Set<String> = emptySet(),
    val actionError: AppError? = null,
)
