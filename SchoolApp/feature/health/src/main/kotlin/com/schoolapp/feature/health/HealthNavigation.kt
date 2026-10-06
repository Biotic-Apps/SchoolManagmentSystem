package com.schoolapp.feature.health

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.HealthCardDestination
import com.schoolapp.feature.health.card.HealthCardRoute
import com.schoolapp.feature.health.report.ReportIncidentRoute
import kotlinx.serialization.Serializable

/** Staff incident report; [studentId] pre-selects the student (opened from a health card). */
@Serializable
internal data class ReportIncidentDestination(val studentId: String? = null)

fun NavGraphBuilder.healthDestinations(navController: NavHostController) {
    composable<HealthCardDestination> {
        HealthCardRoute(
            onBack = navController::popBackStack,
            onReport = { navController.navigate(ReportIncidentDestination(it)) },
        )
    }
    composable<ReportIncidentDestination> { ReportIncidentRoute(onBack = navController::popBackStack) }
}
