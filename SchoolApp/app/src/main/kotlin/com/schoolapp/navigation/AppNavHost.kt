package com.schoolapp.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.schoolapp.AppUiState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.navigation.ForcedPasswordChangeDestination
import com.schoolapp.core.navigation.ShellDestination
import com.schoolapp.feature.auth.navigation.AuthGraph
import com.schoolapp.feature.auth.navigation.authGraph
import com.schoolapp.feature.home.RoleShellRoute
import com.schoolapp.feature.home.ShellContent
import com.schoolapp.feature.profile.password.ForcedChangePasswordRoute

/** Top-level graph; the auth state decides between sign-in (with recovery), forced password change and the role shell. */
@Composable
fun AppNavHost(
    uiState: AppUiState,
    shellContent: ShellContent,
    onSignOut: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (uiState == AppUiState.Loading) {
        Box(modifier.fillMaxSize().background(AppColors.Background), contentAlignment = Alignment.Center) {
            LoadingState()
        }
        return
    }
    val navController = rememberNavController()
    val target: Any = when (uiState) {
        AppUiState.SignedIn -> ShellDestination
        AppUiState.PasswordChangeRequired -> ForcedPasswordChangeDestination
        else -> AuthGraph
    }
    NavHost(
        navController = navController,
        startDestination = target,
        modifier = modifier.background(AppColors.Background),
    ) {
        authGraph(navController)
        composable<ForcedPasswordChangeDestination> { ForcedChangePasswordRoute(onSignOut = onSignOut) }
        composable<ShellDestination> { RoleShellRoute(content = shellContent) }
    }
    LaunchedEffect(target) {
        // Already inside the target (e.g. on Forgot password while signed out): stay there.
        val current = navController.currentDestination
        if (current?.hierarchy?.any { it.hasRoute(target::class) } == true) return@LaunchedEffect
        navController.navigate(target) {
            popUpTo(navController.graph.id) { inclusive = true }
        }
    }
}
