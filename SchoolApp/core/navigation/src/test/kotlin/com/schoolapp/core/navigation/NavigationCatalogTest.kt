package com.schoolapp.core.navigation

import com.schoolapp.core.model.Permission
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NavigationCatalogTest {

    private fun session(role: RoleKey, vararg permissions: String) = SessionContext(
        user = User(id = "u1", fullName = "Test User"),
        assignments = listOf(RoleAssignment("a1", role, ScopeType.BRANCH)),
        activeRole = role,
        permissions = permissions.map(::Permission).toSet(),
    )

    private fun allPermissionsFor(role: RoleKey): Array<String> =
        NavigationCatalog.defaultOrder(role)
            .map { NavigationCatalog.find(it)!!.permission.key }
            .toTypedArray()

    @Test
    fun catalogue_has_34_unique_entries() {
        assertEquals(34, NavigationCatalog.entries.size)
        assertEquals(34, NavigationCatalog.entries.map { it.id }.toSet().size)
    }

    @Test
    fun every_role_order_references_known_ids() {
        RoleKey.entries.forEach { role ->
            val order = NavigationCatalog.defaultOrder(role)
            assertTrue("$role has no menu", order.isNotEmpty())
            order.forEach { id -> assertTrue("$role -> $id", NavigationCatalog.find(id) != null) }
        }
    }

    @Test
    fun menuFor_returns_role_order_when_all_permissions_held() {
        RoleKey.entries.forEach { role ->
            val menu = NavigationCatalog.menuFor(session(role, *allPermissionsFor(role)))
            assertEquals(NavigationCatalog.defaultOrder(role), menu.map { it.id })
        }
    }

    @Test
    fun menuFor_hides_items_without_permission() {
        val menu = NavigationCatalog.menuFor(session(RoleKey.TEACHER, "dashboard.view", "attendance.view"))
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.ATTENDANCE), menu.map { it.id })
    }

    @Test
    fun menuFor_ignores_permissions_outside_role_order() {
        val menu = NavigationCatalog.menuFor(session(RoleKey.HELPER, "dashboard.view", "fees.view", "payroll.view"))
        assertEquals(listOf(MenuIds.DASHBOARD), menu.map { it.id })
    }

    @Test
    fun menuFor_is_empty_without_permissions() {
        assertTrue(NavigationCatalog.menuFor(session(RoleKey.PRINCIPAL)).isEmpty())
    }

    @Test
    fun menuFor_applies_role_label_overrides() {
        val parentMenu = NavigationCatalog.menuFor(session(RoleKey.PARENT, *allPermissionsFor(RoleKey.PARENT)))
        assertEquals("Home", parentMenu.first { it.id == MenuIds.DASHBOARD }.label)
        assertEquals("Child Profile", parentMenu.first { it.id == MenuIds.STUDENTS }.label)
        assertEquals("Fees, Dues & Receipts", parentMenu.first { it.id == MenuIds.FEES }.label)

        val principalMenu = NavigationCatalog.menuFor(session(RoleKey.PRINCIPAL, "branches.view"))
        assertEquals("Branch & Calendar", principalMenu.single().label)

        val teacherMenu = NavigationCatalog.menuFor(session(RoleKey.TEACHER, "classes.view"))
        assertEquals("My Classes & Students", teacherMenu.single().label)
    }

    @Test
    fun labelFor_falls_back_to_catalogue_label() {
        assertEquals("Classes, Sections & Subjects", NavigationCatalog.labelFor(RoleKey.PRINCIPAL, MenuIds.CLASSES))
        assertEquals("Branches", NavigationCatalog.labelFor(RoleKey.SUPER_ADMIN, MenuIds.BRANCHES))
    }

    @Test
    fun menu_sizes_match_navigation_doc() {
        assertEquals(30, NavigationCatalog.defaultOrder(RoleKey.SUPER_ADMIN).size)
        assertEquals(27, NavigationCatalog.defaultOrder(RoleKey.PRINCIPAL).size)
        assertEquals(14, NavigationCatalog.defaultOrder(RoleKey.TEACHER).size)
        assertEquals(12, NavigationCatalog.defaultOrder(RoleKey.PARENT).size)
    }
}
