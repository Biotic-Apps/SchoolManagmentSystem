package com.schoolapp.feature.approvals.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.approvals.detail.ApprovalDetailRoute
import kotlinx.serialization.Serializable

@Serializable
data class ApprovalDetailDestination(val id: String)

fun NavGraphBuilder.approvalsDestinations(navController: NavHostController) {
    composable<ApprovalDetailDestination> { ApprovalDetailRoute(onBack = navController::popBackStack) }
}
