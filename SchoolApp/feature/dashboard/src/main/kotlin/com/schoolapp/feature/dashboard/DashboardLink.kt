package com.schoolapp.feature.dashboard

/** Where a dashboard card leads: a menu of the role shell, or a full-screen destination. */
sealed interface DashboardLink {
    data class Menu(val menuId: String) : DashboardLink

    data class Screen(val destination: Any) : DashboardLink
}

/** The tap action for [link], or null when the role has no such menu (cards then render static). */
internal fun DashboardLink?.action(
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
): (() -> Unit)? = when (this) {
    null -> null
    is DashboardLink.Menu -> if (canOpenMenu(menuId)) ({ onOpenMenu(menuId) }) else null
    is DashboardLink.Screen -> ({ onOpen(destination) })
}

/** Pure form of [action] for tests: whether the link is tappable for the role. */
internal fun DashboardLink?.isOpenable(canOpenMenu: (String) -> Boolean): Boolean = when (this) {
    null -> false
    is DashboardLink.Menu -> canOpenMenu(menuId)
    is DashboardLink.Screen -> true
}
