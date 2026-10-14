package com.schoolapp.feature.admin.schools.setup

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable

/** Full-screen "New school" wizard (POST /schools/setup), opened from the Schools list. */
@Serializable
internal data object SchoolSetupDestination

internal fun NavGraphBuilder.schoolSetupDestination(navController: NavHostController) {
    composable<SchoolSetupDestination> { SchoolSetupRoute(onBack = navController::popBackStack) }
}
