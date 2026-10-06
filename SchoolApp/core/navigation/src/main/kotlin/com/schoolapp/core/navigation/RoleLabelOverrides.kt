package com.schoolapp.core.navigation

import com.schoolapp.core.model.RoleKey

/** Per-role label overrides (docs/navigation.md); anything absent uses the catalogue label. */
internal val RoleLabelOverrides: Map<RoleKey, Map<String, String>> = mapOf(
    RoleKey.PRINCIPAL to mapOf(MenuIds.BRANCHES to "Branch & Calendar", MenuIds.SETTINGS to "Settings"),
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

/** Compact (bottom bar / rail) label overrides per role. */
internal val RoleShortLabelOverrides: Map<RoleKey, Map<String, String>> = mapOf(
    RoleKey.TEACHER to mapOf(MenuIds.CLASSES to "My Classes"),
    RoleKey.PARENT to mapOf(MenuIds.STUDENTS to "Child", MenuIds.PROGRESS to "Results"),
)
