package com.schoolapp.feature.syllabus.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.syllabus.detail.PlanDetailRoute
import kotlinx.serialization.Serializable

/** The list endpoint is filtered by section + subject, so both travel with the plan id. */
@Serializable
data class PlanDetailDestination(val planId: String, val sectionId: String? = null, val subjectId: String? = null)

fun NavGraphBuilder.syllabusDestinations(navController: NavHostController) {
    composable<PlanDetailDestination> { PlanDetailRoute(onBack = navController::popBackStack) }
}
