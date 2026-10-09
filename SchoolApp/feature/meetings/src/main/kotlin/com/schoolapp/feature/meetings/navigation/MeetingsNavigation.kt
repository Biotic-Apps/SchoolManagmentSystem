package com.schoolapp.feature.meetings.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.BookMeetingDestination
import com.schoolapp.feature.meetings.book.BookMeetingRoute
import com.schoolapp.feature.meetings.detail.MeetingDetailRoute
import kotlinx.serialization.Serializable

/** Staff: one meeting; [box] (`UPCOMING`/`PAST`) is where it was listed, since there is no single-meeting endpoint. */
@Serializable
internal data class MeetingDetailDestination(val meetingId: String, val box: String)

fun NavGraphBuilder.meetingsDestinations(navController: NavHostController) {
    composable<BookMeetingDestination> { BookMeetingRoute(onBack = navController::popBackStack) }
    composable<MeetingDetailDestination> { MeetingDetailRoute(onBack = navController::popBackStack) }
}
