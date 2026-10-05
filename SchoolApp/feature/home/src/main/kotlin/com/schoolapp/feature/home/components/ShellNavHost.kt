package com.schoolapp.feature.home.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.schoolapp.core.navigation.MenuDestination
import com.schoolapp.feature.home.ShellContent
import com.schoolapp.feature.home.ShellNavigator

@Composable
internal fun ShellNavHost(
    navController: NavHostController,
    startMenuId: String,
    menuIds: Set<String>,
    content: ShellContent,
    modifier: Modifier = Modifier,
) {
    val navigator = remember(navController, menuIds) { ShellNavigator(navController, menuIds) }
    NavHost(
        navController = navController,
        startDestination = MenuDestination(startMenuId),
        modifier = modifier,
    ) {
        composable<MenuDestination> { entry ->
            val menuId = entry.toRoute<MenuDestination>().menuId
            val screen = content.menuScreens[menuId]
            if (screen != null) screen(navigator) else MenuPlaceholder(menuId = menuId)
        }
        content.destinations(this, navController)
    }
}
