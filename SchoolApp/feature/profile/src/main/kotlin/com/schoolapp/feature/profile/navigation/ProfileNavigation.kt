package com.schoolapp.feature.profile.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.NotificationPreferencesDestination
import com.schoolapp.feature.profile.notifications.NotificationPreferencesRoute
import com.schoolapp.feature.profile.password.ChangePasswordRoute
import com.schoolapp.feature.profile.sessions.DeviceSessionsRoute
import com.schoolapp.feature.profile.twofactor.TwoFactorRoute
import kotlinx.serialization.Serializable

@Serializable
data object ChangePasswordDestination

@Serializable
data object DeviceSessionsDestination

@Serializable
data object TwoFactorDestination

fun NavGraphBuilder.profileDestinations(navController: NavHostController) {
    composable<ChangePasswordDestination> { ChangePasswordRoute(onBack = navController::popBackStack) }
    composable<DeviceSessionsDestination> { DeviceSessionsRoute(onBack = navController::popBackStack) }
    composable<TwoFactorDestination> { TwoFactorRoute(onBack = navController::popBackStack) }
    composable<NotificationPreferencesDestination> { NotificationPreferencesRoute(onBack = navController::popBackStack) }
}
