package com.schoolapp.feature.meetings.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.BookMeetingDestination
import com.schoolapp.feature.meetings.book.BookMeetingRoute
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.detail.MeetingDetailRoute
import com.schoolapp.feature.meetings.staff.schedule.ScheduleMeetingRoute
import kotlinx.serialization.Serializable

/** Staff: one meeting (loaded by id); [box] (`UPCOMING`/`PAST`) is the list it was opened from. */
@Serializable
internal data class MeetingDetailDestination(val meetingId: String, val box: String)

/** Staff (`meetings.add`): schedule a meeting with a student's guardian. */
@Serializable
internal data object ScheduleMeetingDestination

fun NavGraphBuilder.meetingsDestinations(navController: NavHostController) {
    composable<BookMeetingDestination> { BookMeetingRoute(onBack = navController::popBackStack) }
    composable<MeetingDetailDestination> { MeetingDetailRoute(onBack = navController::popBackStack) }
    composable<ScheduleMeetingDestination> {
        ScheduleMeetingRoute(
            onBack = navController::popBackStack,
            onCreated = { id ->
                navController.navigate(MeetingDetailDestination(id, MeetingBox.UPCOMING.name)) {
                    popUpTo<ScheduleMeetingDestination> { inclusive = true }
                }
            },
        )
    }
}
