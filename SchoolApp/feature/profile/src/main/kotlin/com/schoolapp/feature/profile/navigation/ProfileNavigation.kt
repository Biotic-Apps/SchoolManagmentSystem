package com.schoolapp.feature.profile.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.profile.password.ChangePasswordRoute
import com.schoolapp.feature.profile.sessions.DeviceSessionsRoute
import kotlinx.serialization.Serializable

@Serializable
data object ChangePasswordDestination

@Serializable
data object DeviceSessionsDestination

fun NavGraphBuilder.profileDestinations(navController: NavHostController) {
    composable<ChangePasswordDestination> { ChangePasswordRoute(onBack = navController::popBackStack) }
    composable<DeviceSessionsDestination> { DeviceSessionsRoute(onBack = navController::popBackStack) }
}
