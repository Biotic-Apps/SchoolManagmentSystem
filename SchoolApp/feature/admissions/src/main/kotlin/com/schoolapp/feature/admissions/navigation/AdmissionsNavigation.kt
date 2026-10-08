package com.schoolapp.feature.admissions.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.admissions.detail.ApplicationDetailRoute
import com.schoolapp.feature.admissions.create.NewApplicationRoute
import kotlinx.serialization.Serializable

@Serializable
data class ApplicationDetailDestination(val id: String)

/** New admission application (`admissions.add`). */
@Serializable
data object NewApplicationDestination

fun NavGraphBuilder.admissionsDestinations(navController: NavHostController) {
    composable<ApplicationDetailDestination> { ApplicationDetailRoute(onBack = navController::popBackStack) }
    composable<NewApplicationDestination> {
        NewApplicationRoute(
            onBack = navController::popBackStack,
            onCreated = { id ->
                navController.navigate(ApplicationDetailDestination(id)) { popUpTo<NewApplicationDestination> { inclusive = true } }
            },
        )
    }
}
