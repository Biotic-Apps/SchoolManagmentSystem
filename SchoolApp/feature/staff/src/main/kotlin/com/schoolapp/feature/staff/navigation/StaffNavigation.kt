package com.schoolapp.feature.staff.navigation

import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.schoolapp.feature.staff.add.AddStaffRoute
import com.schoolapp.feature.staff.assign.AssignClassesRoute
import com.schoolapp.feature.staff.detail.StaffDetailRoute
import com.schoolapp.feature.staff.edit.EditStaffRoute
import kotlinx.serialization.Serializable

@Serializable
data class StaffDetailDestination(val id: String)

@Serializable
data object AddStaffDestination

@Serializable
data class EditStaffDestination(val id: String)

@Serializable
data class AssignClassesDestination(val staffId: String, val staffName: String, val branchId: String)

fun NavGraphBuilder.staffDestinations(navController: NavHostController) {
    composable<StaffDetailDestination> {
        StaffDetailRoute(
            onBack = navController::popBackStack,
            onEdit = { navController.navigate(EditStaffDestination(it)) },
            onAssign = { id, name, branchId -> navController.navigate(AssignClassesDestination(id, name, branchId)) },
        )
    }
    composable<AddStaffDestination> {
        AddStaffRoute(
            onBack = navController::popBackStack,
            onDone = { done ->
                val next: Any = if (done.assignClasses && done.branchId.isNotEmpty()) {
                    AssignClassesDestination(done.staffId, done.staffName, done.branchId)
                } else {
                    StaffDetailDestination(done.staffId)
                }
                // The add form (and its one-time password) is gone from the back stack once the record exists.
                navController.navigate(next) { popUpTo<AddStaffDestination> { inclusive = true } }
            },
        )
    }
    composable<EditStaffDestination> { EditStaffRoute(onBack = navController::popBackStack) }
    composable<AssignClassesDestination> { entry ->
        AssignClassesRoute(
            onDone = {
                val staffId = entry.toRoute<AssignClassesDestination>().staffId
                // From the add flow: continue to the new profile. From a profile: just go back to it.
                val cameFromProfile = navController.previousBackStackEntry?.destination?.hasRoute<StaffDetailDestination>() == true
                if (cameFromProfile) {
                    navController.popBackStack()
                } else {
                    navController.navigate(StaffDetailDestination(staffId)) { popUpTo<AssignClassesDestination> { inclusive = true } }
                }
            },
        )
    }
}
