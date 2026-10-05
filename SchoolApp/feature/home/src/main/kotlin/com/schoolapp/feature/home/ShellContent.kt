package com.schoolapp.feature.home

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController

/**
 * Feature screens plugged into the shell by :app. Menu ids without an entry in [menuScreens]
 * show the "Coming in Phase N" placeholder; [destinations] registers detail routes.
 */
@Immutable
class ShellContent(
    val menuScreens: Map<String, @Composable (ShellNavigator) -> Unit> = emptyMap(),
    val destinations: NavGraphBuilder.(NavHostController) -> Unit = {},
)
