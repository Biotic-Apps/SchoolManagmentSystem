package com.schoolapp.feature.dashboard

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext

/** Which dashboard the active role gets. */
internal enum class DashboardMode { SUPERVISOR, TEACHER, PARENT, WELCOME }

internal fun SessionContext.dashboardMode(): DashboardMode = when {
    activeRole == RoleKey.PARENT -> DashboardMode.PARENT
    activeRole in TEACHER_ROLES -> DashboardMode.TEACHER
    activeRole in SUPERVISOR_ROLES && has(DASHBOARD_VIEW) -> DashboardMode.SUPERVISOR
    else -> DashboardMode.WELCOME
}

/** Super admin keeps the summary only; branch supervisors also get the Today queue. */
internal fun SessionContext.showsTodayQueue(): Boolean = activeRole in TODAY_ROLES

private val TEACHER_ROLES = setOf(RoleKey.TEACHER, RoleKey.HELPER)
private val TODAY_ROLES = setOf(RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER)
private val SUPERVISOR_ROLES = TODAY_ROLES + RoleKey.SUPER_ADMIN
private const val DASHBOARD_VIEW = "dashboard.view"
