package com.schoolapp.feature.meetings.staff

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.domain.MeetingPage

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
    val upcoming: MeetingPage = MeetingPage(),
    val past: MeetingPage = MeetingPage(),
    /** OPEN follow-ups owned by the caller. */
    val followUps: List<FollowUp> = emptyList(),
    val today: String = "",
    val busyFollowUpIds: Set<String> = emptySet(),
    val actionError: AppError? = null,
    /** `meetings.add`: staff may schedule a meeting with a guardian. */
    val canSchedule: Boolean = false,
) {
    fun page(box: MeetingBox): MeetingPage = if (box == MeetingBox.UPCOMING) upcoming else past
}
