package com.schoolapp.feature.home

import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo
import androidx.compose.runtime.Composable
import androidx.window.core.layout.WindowSizeClass

/** Phones: 4 destinations + "More" sheet. Tablets/landscape: a scrollable rail or a drawer with every item. */
enum class ShellNavigationLayout { BottomBar, Rail, Drawer }

@Composable
internal fun rememberShellNavigationLayout(): ShellNavigationLayout {
    val sizeClass = currentWindowAdaptiveInfo().windowSizeClass
    return when {
        sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND) -> ShellNavigationLayout.Drawer
        sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND) -> ShellNavigationLayout.Rail
        else -> ShellNavigationLayout.BottomBar
    }
}
