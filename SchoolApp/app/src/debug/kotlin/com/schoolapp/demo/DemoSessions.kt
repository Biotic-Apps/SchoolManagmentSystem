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
        ChildSummary("demo-child-1", "Ayesha Khan", "Class 5", "A", "Main Branch"),
        ChildSummary("demo-child-2", "Omar Khan", "Class 2", "B", "Main Branch"),
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
            val extra = if (role in approvers) listOf(Permission("approvals.approve")) else emptyList()
            (menu + extra).toSet()
        }
        is CustomRole -> frontDeskPermissions.map(::Permission).toSet()
    }

    private fun scopeFor(role: RoleRef) = when (role) {
        RoleKey.SUPER_ADMIN -> ScopeType.GLOBAL
        RoleKey.TEACHER, RoleKey.HELPER -> ScopeType.SECTION
        RoleKey.PARENT -> ScopeType.GUARDIAN
        else -> ScopeType.BRANCH
    }
}
