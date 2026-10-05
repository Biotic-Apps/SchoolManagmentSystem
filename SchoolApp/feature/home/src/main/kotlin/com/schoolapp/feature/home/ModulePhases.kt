package com.schoolapp.feature.home

import com.schoolapp.core.navigation.MenuIds

/** Delivery phase per menu module, from docs/PROGRESS.md. */
internal object ModulePhases {
    private val phases: Map<String, Int> = mapOf(
        MenuIds.SCHOOLS to 1, MenuIds.BRANCHES to 1, MenuIds.USERS to 1, MenuIds.ROLES to 1,
        MenuIds.SESSIONS to 1, MenuIds.CLASSES to 1, MenuIds.APPROVALS to 1, MenuIds.PROFILE to 1,
        MenuIds.ADMISSIONS to 2, MenuIds.STUDENTS to 2, MenuIds.GUARDIANS to 2, MenuIds.STAFF to 2,
        MenuIds.TIMETABLE to 2, MenuIds.SYLLABUS to 2,
        MenuIds.DASHBOARD to 3, MenuIds.ATTENDANCE to 3, MenuIds.DIARY to 3, MenuIds.ACTIVITIES to 3,
        MenuIds.NOTICES to 3, MenuIds.MESSAGES to 3, MenuIds.COMPLAINTS to 3, MenuIds.MEETINGS to 3,
        MenuIds.HEALTH to 3, MenuIds.PICKUP to 3,
        MenuIds.EXAMS to 4, MenuIds.PROGRESS to 4, MenuIds.FEES to 4, MenuIds.PAYROLL to 4,
        MenuIds.EXPENSES to 4, MenuIds.INVENTORY to 4, MenuIds.CERTIFICATES to 4, MenuIds.REPORTS to 4,
        MenuIds.MY_SALARY to 4,
        MenuIds.SETTINGS to 5,
    )

    fun phaseFor(menuId: String): Int? = phases[menuId]
}
