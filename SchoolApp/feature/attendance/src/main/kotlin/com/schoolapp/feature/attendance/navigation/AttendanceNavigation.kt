package com.schoolapp.feature.attendance.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.AttendanceRegisterDestination
import com.schoolapp.core.navigation.LeaveReviewDestination
import com.schoolapp.feature.attendance.register.RegisterRoute
import com.schoolapp.feature.attendance.review.LeaveReviewRoute

fun NavGraphBuilder.attendanceDestinations(navController: NavHostController) {
    composable<AttendanceRegisterDestination> {
        RegisterRoute(onBack = navController::popBackStack, onOpen = { navController.navigate(it) })
    }
    composable<LeaveReviewDestination> { LeaveReviewRoute(onBack = navController::popBackStack) }
}
