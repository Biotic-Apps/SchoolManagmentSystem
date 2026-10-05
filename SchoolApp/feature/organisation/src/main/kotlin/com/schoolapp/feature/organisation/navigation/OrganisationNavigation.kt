package com.schoolapp.feature.organisation.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.organisation.branches.BranchDetailRoute
import kotlinx.serialization.Serializable

@Serializable
data class BranchDetailDestination(val id: String)

fun NavGraphBuilder.organisationDestinations(navController: NavHostController) {
    composable<BranchDetailDestination> { BranchDetailRoute(onBack = navController::popBackStack) }
}
