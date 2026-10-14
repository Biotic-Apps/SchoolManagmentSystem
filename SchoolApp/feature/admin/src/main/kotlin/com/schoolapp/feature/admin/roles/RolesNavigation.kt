package com.schoolapp.feature.admin.roles

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.admin.roles.editor.RoleEditorRoute
import kotlinx.serialization.Serializable

/** Create (null [roleId]) or view/edit a role and its permission matrix. */
@Serializable
data class RoleEditorDestination(val roleId: String? = null)

internal fun NavGraphBuilder.rolesDestinations(navController: NavHostController) {
    composable<RoleEditorDestination> { RoleEditorRoute(onBack = navController::popBackStack) }
}
