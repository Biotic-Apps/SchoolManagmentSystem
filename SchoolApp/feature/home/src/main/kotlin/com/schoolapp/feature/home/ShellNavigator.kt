package com.schoolapp.feature.home

import androidx.compose.runtime.Stable
import androidx.navigation.NavHostController
import com.schoolapp.core.model.RoleRef

/** Navigation available to menu screens; menu jumps are limited to the active role's menu. */
@Stable
class ShellNavigator(
    private val navController: NavHostController,
    private val menuIds: Set<String>,
    private val homeMenuId: String,
    /** Lets one menu id show a role-specific screen (e.g. "classes" for teachers vs. principals). */
    val activeRole: RoleRef,
) {
    fun canOpenMenu(id: String): Boolean = id in menuIds

    fun openMenu(id: String) {
        if (!canOpenMenu(id)) return
        navController.navigateToMenu(id, homeMenuId)
    }

    fun open(route: Any) = navController.navigate(route)
}
