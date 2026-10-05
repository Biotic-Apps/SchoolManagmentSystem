package com.schoolapp.feature.notifications.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.NotificationsDestination
import com.schoolapp.feature.notifications.NotificationsRoute

fun NavGraphBuilder.notificationsDestinations(navController: NavHostController) {
    composable<NotificationsDestination> { NotificationsRoute(onBack = navController::popBackStack) }
}
