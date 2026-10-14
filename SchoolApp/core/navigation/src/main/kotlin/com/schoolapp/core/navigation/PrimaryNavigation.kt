package com.schoolapp.core.navigation

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef

/** Bottom-bar destinations and the rest (reachable from the navigation drawer, which lists everything). */
data class NavigationSplit(val primary: List<MenuItem>, val overflow: List<MenuItem>)

/**
 * The compact bottom bar shows at most [MAX_PRIMARY] destinations (no "More"). Each system role puts its
 * most used screens there; anything the user lacks is topped up from the menu order. Wider layouts
 * (rail, drawer) show every item and need no split.
 */
object PrimaryNavigation {
    const val MAX_PRIMARY = 4

    /** Rarely used admin modules: reachable from the drawer, never given a bottom-bar slot. */
    val DrawerOnly: Set<String> = setOf(
        MenuIds.SCHOOLS, MenuIds.USERS, MenuIds.ROLES, MenuIds.EXPENSES, MenuIds.INVENTORY, MenuIds.REPORTS,
        MenuIds.SETTINGS,
    )

    private val Preferred: Map<RoleKey, List<String>> = mapOf(
        RoleKey.SUPER_ADMIN to listOf(MenuIds.DASHBOARD, MenuIds.BRANCHES, MenuIds.STAFF, MenuIds.APPROVALS),
        RoleKey.PRINCIPAL to listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.STUDENTS, MenuIds.APPROVALS),
        RoleKey.COORDINATOR to listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.ATTENDANCE, MenuIds.APPROVALS),
        RoleKey.HEAD_TEACHER to listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.ATTENDANCE, MenuIds.APPROVALS),
        RoleKey.TEACHER to listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.ATTENDANCE, MenuIds.DIARY),
        RoleKey.HELPER to listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.ATTENDANCE, MenuIds.DIARY),
        RoleKey.ACCOUNTANT to listOf(MenuIds.DASHBOARD, MenuIds.STUDENTS, MenuIds.FEES, MenuIds.PAYROLL),
        RoleKey.PARENT to listOf(MenuIds.DASHBOARD, MenuIds.STUDENTS, MenuIds.DIARY, MenuIds.ATTENDANCE),
    )

    fun preferred(role: RoleRef): List<String> = (role as? RoleKey)?.let(Preferred::get).orEmpty()

    fun split(menu: List<MenuItem>, role: RoleRef, max: Int = MAX_PRIMARY): NavigationSplit {
        if (menu.size <= max && menu.none { it.id in DrawerOnly }) return NavigationSplit(menu, emptyList())
        val byId = menu.associateBy { it.id }
        val chosen = preferred(role).filterNot(DrawerOnly::contains).mapNotNull(byId::get).take(max).toMutableList()
        menu.forEach { if (chosen.size < max && it !in chosen && it.id !in DrawerOnly) chosen += it }
        // Keep the bar in menu order so Home stays first.
        val primary = menu.filter { it in chosen }
        return NavigationSplit(primary, menu.filterNot { it in chosen })
    }
}
