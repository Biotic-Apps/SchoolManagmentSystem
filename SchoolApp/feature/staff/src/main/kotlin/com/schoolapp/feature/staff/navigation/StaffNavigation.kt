package com.schoolapp.feature.staff.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.staff.detail.StaffDetailRoute
import kotlinx.serialization.Serializable

@Serializable
data class StaffDetailDestination(val id: String)

fun NavGraphBuilder.staffDestinations(navController: NavHostController) {
    composable<StaffDetailDestination> { StaffDetailRoute(onBack = navController::popBackStack) }
}
