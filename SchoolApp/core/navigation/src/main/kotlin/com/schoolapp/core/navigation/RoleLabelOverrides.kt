package com.schoolapp.core.navigation

import com.schoolapp.core.model.RoleKey

/** Per-role label overrides (docs/navigation.md); anything absent uses the catalogue label. */
internal val RoleLabelOverrides: Map<RoleKey, Map<String, String>> = mapOf(
    RoleKey.PRINCIPAL to mapOf(MenuIds.BRANCHES to "Branch & Calendar"),
    RoleKey.TEACHER to mapOf(MenuIds.CLASSES to "My Classes & Students"),
    RoleKey.PARENT to mapOf(
        MenuIds.DASHBOARD to "Home",
        MenuIds.STUDENTS to "Child Profile",
        MenuIds.PROGRESS to "Progress & Results",
        MenuIds.TIMETABLE to "Timetable, Calendar & Activities",
        MenuIds.FEES to "Fees, Dues & Receipts",
        MenuIds.MESSAGES to "Messages, Notices & Requests",
    ),
)
