package com.schoolapp.feature.admin.schools

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.admin.schools.delete.DeleteSchoolRoute
import com.schoolapp.feature.admin.schools.detail.SchoolDetailRoute
import com.schoolapp.feature.admin.schools.edit.SchoolEditRoute
import kotlinx.serialization.Serializable

@Serializable
internal data class SchoolDetailDestination(val schoolId: String)

@Serializable
internal data class SchoolEditDestination(val schoolId: String)

/** Permanent delete with the typed school code; runs as a background job on the server. */
@Serializable
internal data class SchoolDeleteDestination(val schoolId: String)

/** School detail / edit / delete screens opened from the Schools menu. */
internal fun NavGraphBuilder.schoolsDestinations(navController: NavHostController) {
    composable<SchoolDetailDestination> {
        SchoolDetailRoute(
            onBack = navController::popBackStack,
            onEdit = { navController.navigate(SchoolEditDestination(it)) },
            onDelete = { navController.navigate(SchoolDeleteDestination(it)) },
        )
    }
    composable<SchoolEditDestination> { SchoolEditRoute(onBack = navController::popBackStack) }
    composable<SchoolDeleteDestination> {
        DeleteSchoolRoute(
            onBack = navController::popBackStack,
            // Deleted: leave the detail of the school that no longer exists as well.
            onDeleted = { navController.popBackStack<SchoolDetailDestination>(inclusive = true) },
        )
    }
}
