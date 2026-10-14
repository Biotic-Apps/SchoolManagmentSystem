package com.schoolapp.feature.meetings

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.navigation.BookMeetingDestination
import com.schoolapp.feature.meetings.navigation.MeetingDetailDestination
import com.schoolapp.feature.meetings.navigation.ScheduleMeetingDestination
import com.schoolapp.feature.meetings.parent.ParentMeetingsRoute
import com.schoolapp.feature.meetings.staff.StaffMeetingsRoute

/** Menu id `meetings`, rendered inside the role shell (no top bar): parents book and review, staff run meetings. */
@Composable
fun MeetingsMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    if (role == RoleKey.PARENT) {
        ParentMeetingsRoute(onBook = { onOpen(BookMeetingDestination) }, modifier = modifier)
    } else {
        StaffMeetingsRoute(
            onOpenMeeting = { id, box -> onOpen(MeetingDetailDestination(id, box.name)) },
            onSchedule = { onOpen(ScheduleMeetingDestination) },
            modifier = modifier,
            viewModel = hiltViewModel(key = "meetings_${role.key}"),
            slotsViewModel = hiltViewModel(key = "meeting_slots_${role.key}"),
        )
    }
}
