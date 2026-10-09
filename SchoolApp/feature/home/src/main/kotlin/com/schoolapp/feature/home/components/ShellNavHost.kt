package com.schoolapp.feature.home.components

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.schoolapp.core.designsystem.motion.ScreenTransitions
import com.schoolapp.core.designsystem.theme.AppTheme
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.navigation.MenuDestination
import com.schoolapp.feature.home.ShellContent
import com.schoolapp.feature.home.ShellNavigator

@Composable
internal fun ShellNavHost(
    navController: NavHostController,
    startMenuId: String,
    menuIds: Set<String>,
    activeRole: RoleRef,
    content: ShellContent,
    modifier: Modifier = Modifier,
) {
    val reduced = AppTheme.reducedMotion
    val navigator = remember(navController, menuIds, startMenuId, activeRole) { ShellNavigator(navController, menuIds, startMenuId, activeRole) }
    NavHost(
        navController = navController,
        startDestination = MenuDestination(startMenuId),
        modifier = modifier,
        enterTransition = { if (isMenuSwitch()) ScreenTransitions.peerEnter(reduced) else ScreenTransitions.forwardEnter(reduced) },
        exitTransition = { if (isMenuSwitch()) ScreenTransitions.peerExit() else ScreenTransitions.forwardExit(reduced) },
        popEnterTransition = { if (isMenuSwitch()) ScreenTransitions.peerEnter(reduced) else ScreenTransitions.backEnter(reduced) },
        popExitTransition = { if (isMenuSwitch()) ScreenTransitions.peerExit() else ScreenTransitions.backExit(reduced) },
    ) {
        composable<MenuDestination> { entry ->
            val menuId = entry.toRoute<MenuDestination>().menuId
            val screen = content.menuScreens[menuId]
            if (screen != null) screen(navigator) else MenuPlaceholder(menuId = menuId)
        }
        content.destinations(this, navController)
    }
}

/** Switching between top-level menu screens (bottom bar, drawer) is a peer change, not forward navigation. */
private fun AnimatedContentTransitionScope<NavBackStackEntry>.isMenuSwitch(): Boolean =
    initialState.destination.hasRoute(MenuDestination::class) && targetState.destination.hasRoute(MenuDestination::class)
