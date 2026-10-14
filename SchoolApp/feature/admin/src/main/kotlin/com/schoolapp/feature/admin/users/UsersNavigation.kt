package com.schoolapp.feature.admin.users

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.admin.users.assignments.AddAssignmentRoute
import com.schoolapp.feature.admin.users.detail.UserDetailRoute
import com.schoolapp.feature.admin.users.form.CreateUserRoute
import com.schoolapp.feature.admin.users.form.EditUserRoute
import kotlinx.serialization.Serializable

@Serializable
internal data class UserDetailDestination(val userId: String)

@Serializable
internal data object CreateUserDestination

@Serializable
internal data class EditUserDestination(val userId: String)

@Serializable
internal data class AddAssignmentDestination(val userId: String, val userName: String)

/** User detail / create / edit / assign-role screens opened from the Principals & Admin Users menu. */
internal fun NavGraphBuilder.usersDestinations(navController: NavHostController) {
    composable<UserDetailDestination> {
        UserDetailRoute(
            onBack = navController::popBackStack,
            onEdit = { navController.navigate(EditUserDestination(it)) },
            onAssignRole = { id, name -> navController.navigate(AddAssignmentDestination(id, name)) },
        )
    }
    composable<CreateUserDestination> { CreateUserRoute(onBack = navController::popBackStack) }
    composable<EditUserDestination> { EditUserRoute(onBack = navController::popBackStack) }
    composable<AddAssignmentDestination> { AddAssignmentRoute(onBack = navController::popBackStack) }
}
