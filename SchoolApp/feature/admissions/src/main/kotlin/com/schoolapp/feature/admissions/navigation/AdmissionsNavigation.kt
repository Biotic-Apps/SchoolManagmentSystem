package com.schoolapp.feature.admissions.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.admissions.detail.ApplicationDetailRoute
import kotlinx.serialization.Serializable

@Serializable
data class ApplicationDetailDestination(val id: String)

fun NavGraphBuilder.admissionsDestinations(navController: NavHostController) {
    composable<ApplicationDetailDestination> { ApplicationDetailRoute(onBack = navController::popBackStack) }
}
