package com.schoolapp.core.navigation

import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.Permission
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CustomRoleMenuTest {

    private val frontDesk = CustomRole("CUSTOM_FRONT_DESK")

    private fun session(role: RoleRef, vararg permissions: String) = SessionContext(
        user = User(id = "u1", fullName = "Test User"),
        assignments = listOf(RoleAssignment("a1", role, ScopeType.BRANCH)),
        activeRole = role,
        permissions = permissions.map(::Permission).toSet(),
    )

    @Test
    fun custom_role_menu_follows_view_permissions_in_catalogue_order() {
        val menu = NavigationCatalog.menuFor(
            session(frontDesk, "profile.view", "students.view", "dashboard.view", "fees.view", "approvals.view"),
        )
        assertEquals(
            listOf(MenuIds.DASHBOARD, MenuIds.STUDENTS, MenuIds.FEES, MenuIds.APPROVALS, MenuIds.PROFILE),
            menu.map { it.id },
        )
    }

    @Test
    fun custom_role_ignores_non_view_permissions_and_uses_catalogue_labels() {
        val menu = NavigationCatalog.menuFor(session(frontDesk, "fees.add", "fees.view", "dashboard.view"))
        assertEquals(listOf("Dashboard", "Fees & Dues"), menu.map { it.label })
    }

    @Test
    fun custom_role_can_reach_entries_outside_any_system_default() {
        val menu = NavigationCatalog.menuFor(session(frontDesk, "settings.view", "my_salary.view", "self.payroll.view"))
        assertEquals(listOf(MenuIds.MY_SALARY, MenuIds.SETTINGS), menu.map { it.id })
    }

    @Test
    fun custom_role_with_every_permission_sees_the_whole_catalogue() {
        val all = NavigationCatalog.entries.map { it.permission.key }.toTypedArray()
        assertEquals(NavigationCatalog.entries.map { it.id }, NavigationCatalog.menuFor(session(frontDesk, *all)).map { it.id })
    }

    @Test
    fun custom_role_without_permissions_has_no_menu() {
        assertTrue(NavigationCatalog.menuFor(session(frontDesk)).isEmpty())
    }

    @Test
    fun system_role_keys_still_resolve_to_system_roles() {
        assertEquals(RoleKey.PRINCIPAL, RoleRef.of("PRINCIPAL"))
        assertEquals(frontDesk, RoleRef.of("CUSTOM_FRONT_DESK"))
        assertEquals("Classes, Sections & Subjects", NavigationCatalog.labelFor(frontDesk, MenuIds.CLASSES))
    }
}
