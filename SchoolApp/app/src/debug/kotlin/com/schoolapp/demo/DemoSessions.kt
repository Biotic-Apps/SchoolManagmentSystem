package com.schoolapp.demo

import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.Permission
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import com.schoolapp.core.navigation.NavigationCatalog

/** Local-only sessions for previewing the shell per role without a backend. */
internal object DemoSessions {

    val FrontDesk = CustomRole("CUSTOM_FRONT_DESK")
    private const val FRONT_DESK_NAME = "Front Desk"

    val roles: List<RoleRef> = RoleKey.entries + FrontDesk

    private val children = listOf(
        ChildSummary(DemoPeopleData.CHILD_1, "Ayesha Khan", "Class 5", "A", "Main Branch", null, "BS-2026-0010", "2026-27"),
        ChildSummary(DemoPeopleData.CHILD_2, "Omar Khan", "Class 4", "B", "Main Branch", null, "BS-2026-0040", "2026-27"),
    )

    private val approvers = setOf(RoleKey.SUPER_ADMIN, RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER)

    private val frontDeskPermissions = listOf(
        "dashboard.view", "students.view", "admissions.view", "notices.view", "approvals.view", "profile.view",
    )

    private val assignments = roles.map { role ->
        val global = role == RoleKey.SUPER_ADMIN
        RoleAssignment(
            id = "demo-${role.key}",
            role = role,
            scopeType = scopeFor(role),
            roleName = if (role == FrontDesk) FRONT_DESK_NAME else null,
            schoolId = if (global) null else DemoData.SCHOOL_ID,
            schoolName = if (global) null else DemoData.SCHOOL_NAME,
            branchId = if (global || role == RoleKey.PARENT) null else DemoData.MAIN_BRANCH_ID,
            branchName = if (global || role == RoleKey.PARENT) null else DemoData.MAIN_BRANCH_NAME,
        )
    }

    fun forRole(role: RoleRef, activeChildId: String? = null, user: User = DemoUser) = SessionContext(
        user = user,
        assignments = assignments,
        activeRole = role,
        permissions = permissionsFor(role),
        children = if (role == RoleKey.PARENT) children else emptyList(),
        activeChildId = if (role == RoleKey.PARENT) activeChildId ?: children.first().id else null,
    )

    private val DemoUser = User(id = "demo-user", fullName = "Demo User", email = "demo@eschool.local", phone = "03001234567")

    private fun permissionsFor(role: RoleRef): Set<Permission> = when (role) {
        is RoleKey -> {
            val menu = NavigationCatalog.defaultOrder(role).mapNotNull { NavigationCatalog.find(it)?.permission }
            val extra = (if (role in approvers) listOf("approvals.approve") else emptyList()) + extraPermissions[role].orEmpty()
            (menu + extra.map(::Permission)).toSet()
        }
        is CustomRole -> frontDeskPermissions.map(::Permission).toSet()
    }

    private val supervisorPhase3 = listOf(
        "teacherwork.proxy", "attendance.edit", "attendance.submit", "diary.approve", "complaints.view", "pickup.view",
    )

    /** Action permissions used inside Phase 2 / Phase 3 screens (not menu entries). */
    private val extraPermissions: Map<RoleKey, List<String>> = mapOf(
        RoleKey.TEACHER to listOf(
            "syllabus.edit", "students.view",
            "attendance.edit", "attendance.submit", "diary.edit", "diary.publish", "activities.add", "health.view",
            "notices.view", "messages.view", "meetings.view",
        ),
        RoleKey.HELPER to listOf("attendance.edit", "diary.edit", "health.view"),
        RoleKey.PRINCIPAL to listOf(
            "admissions.approve", "syllabus.approve",
            "attendance.edit", "attendance.submit", "attendance.approve", "teacherwork.proxy", "diary.approve", "diary.edit",
            "diary.publish", "activities.approve", "activities.add", "notices.add", "notices.publish", "complaints.edit",
            "health.edit", "pickup.edit", "complaints.view", "pickup.view",
        ),
        RoleKey.COORDINATOR to listOf("syllabus.approve") + supervisorPhase3,
        RoleKey.HEAD_TEACHER to supervisorPhase3,
        RoleKey.SUPER_ADMIN to listOf("complaints.edit"),
    )

    private fun scopeFor(role: RoleRef) = when (role) {
        RoleKey.SUPER_ADMIN -> ScopeType.GLOBAL
        RoleKey.TEACHER, RoleKey.HELPER -> ScopeType.SECTION
        RoleKey.PARENT -> ScopeType.GUARDIAN
        else -> ScopeType.BRANCH
    }
}
