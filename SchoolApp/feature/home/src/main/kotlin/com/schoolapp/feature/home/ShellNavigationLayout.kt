package com.schoolapp.feature.home

import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo
import androidx.compose.runtime.Composable
import androidx.window.core.layout.WindowSizeClass

enum class ShellNavigationLayout(val primaryCount: Int) {
    BottomBar(primaryCount = 4),
    Rail(primaryCount = 5),
    Drawer(primaryCount = Int.MAX_VALUE),
}

@Composable
internal fun rememberShellNavigationLayout(): ShellNavigationLayout {
    val sizeClass = currentWindowAdaptiveInfo().windowSizeClass
    return when {
        sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_EXPANDED_LOWER_BOUND) -> ShellNavigationLayout.Drawer
        sizeClass.isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND) -> ShellNavigationLayout.Rail
        else -> ShellNavigationLayout.BottomBar
    }
}

/** Items shown directly in the bar/rail; the rest go to the "More" sheet. */
internal fun <T> List<T>.splitForLayout(layout: ShellNavigationLayout): Pair<List<T>, List<T>> =
    if (size <= layout.primaryCount + 1) this to emptyList() else take(layout.primaryCount) to drop(layout.primaryCount)
