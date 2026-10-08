package com.schoolapp.feature.organisation.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.ClassSetupDestination
import com.schoolapp.core.navigation.TimetableBuilderDestination
import com.schoolapp.feature.organisation.branches.BranchDetailRoute
import com.schoolapp.feature.organisation.setup.ClassSetupRoute
import kotlinx.serialization.Serializable

@Serializable
data class BranchDetailDestination(val id: String)

/** [canBuildTimetable] = the active role may edit timetable drafts (Class setup then links to the builder). */
fun NavGraphBuilder.organisationDestinations(navController: NavHostController, canBuildTimetable: () -> Boolean = { false }) {
    composable<BranchDetailDestination> { BranchDetailRoute(onBack = navController::popBackStack) }
    composable<ClassSetupDestination> {
        ClassSetupRoute(
            onBack = navController::popBackStack,
            onOpenTimetable = { sectionId: String, title: String ->
                navController.navigate(TimetableBuilderDestination(sectionId, title))
            }.takeIf { canBuildTimetable() },
        )
    }
}
