package com.schoolapp.core.navigation

import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PrimaryNavigationTest {

    private fun fullMenu(role: RoleKey): List<MenuItem> {
        val permissions = NavigationCatalog.defaultOrder(role).map { NavigationCatalog.find(it)!!.permission }.toSet()
        return NavigationCatalog.menuFor(
            SessionContext(User("u1", "Test"), listOf(RoleAssignment("a1", role, ScopeType.BRANCH)), role, permissions),
        )
    }

    private fun primaryIds(role: RoleKey) = PrimaryNavigation.split(fullMenu(role), role).primary.map { it.id }

    @Test
    fun each_role_gets_its_most_used_four() {
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.ATTENDANCE, MenuIds.DIARY), primaryIds(RoleKey.TEACHER))
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.STUDENTS, MenuIds.DIARY, MenuIds.ATTENDANCE), primaryIds(RoleKey.PARENT))
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.STUDENTS, MenuIds.APPROVALS), primaryIds(RoleKey.PRINCIPAL))
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.STUDENTS, MenuIds.FEES, MenuIds.PAYROLL), primaryIds(RoleKey.ACCOUNTANT))
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.BRANCHES, MenuIds.STAFF, MenuIds.APPROVALS), primaryIds(RoleKey.SUPER_ADMIN))
    }

    @Test
    fun bottom_bar_never_holds_web_only_placeholders() {
        RoleKey.entries.forEach { role ->
            val primary = PrimaryNavigation.split(fullMenu(role), role).primary.map { it.id }
            assertTrue("$role $primary", primary.none(PrimaryNavigation.DrawerOnly::contains))
        }
        val custom = NavigationCatalog.entries.filter { it.id in PrimaryNavigation.DrawerOnly || it.id == MenuIds.DASHBOARD } +
            NavigationCatalog.entries.filter { it.id == MenuIds.NOTICES }
        val split = PrimaryNavigation.split(custom, CustomRole("auditor"))
        assertTrue(split.primary.none { it.id in PrimaryNavigation.DrawerOnly })
    }

    @Test
    fun every_role_has_at_most_four_and_nothing_is_lost() {
        RoleKey.entries.forEach { role ->
            val menu = fullMenu(role)
            val split = PrimaryNavigation.split(menu, role)
            assertTrue("$role primary", split.primary.size <= PrimaryNavigation.MAX_PRIMARY)
            assertEquals("$role", menu.map { it.id }.toSet(), (split.primary + split.overflow).map { it.id }.toSet())
            assertEquals(MenuIds.DASHBOARD, split.primary.first().id)
        }
    }

    @Test
    fun primary_labels_never_truncate() {
        RoleKey.entries.forEach { role ->
            PrimaryNavigation.split(fullMenu(role), role).primary.forEach {
                assertTrue("$role ${it.id} '${it.shortLabel}'", it.shortLabel.length <= 10)
            }
        }
        assertEquals("Classes", fullMenu(RoleKey.TEACHER).first { it.id == MenuIds.CLASSES }.shortLabel)
    }

    @Test
    fun missing_preferred_items_are_topped_up_in_menu_order() {
        val menu = fullMenu(RoleKey.TEACHER).filterNot { it.id == MenuIds.DIARY }
        val split = PrimaryNavigation.split(menu, RoleKey.TEACHER)
        assertEquals(listOf(MenuIds.DASHBOARD, MenuIds.CLASSES, MenuIds.TIMETABLE, MenuIds.ATTENDANCE), split.primary.map { it.id })
    }

    @Test
    fun short_menus_have_no_more_and_custom_roles_take_the_first_four() {
        val small = fullMenu(RoleKey.TEACHER).take(4)
        assertTrue(PrimaryNavigation.split(small, RoleKey.TEACHER).overflow.isEmpty())
        val custom = NavigationCatalog.entries.take(10)
        val split = PrimaryNavigation.split(custom, CustomRole("librarian"))
        val inApp = custom.filterNot { it.id in PrimaryNavigation.DrawerOnly }
        assertEquals(inApp.take(4), split.primary)
        assertEquals(custom.filterNot { it in inApp.take(4) }, split.overflow)
    }

    @Test
    fun drawer_groups_put_salary_under_my_work_and_account_last() {
        val groups = MenuGroups.group(fullMenu(RoleKey.TEACHER))
        assertEquals(MenuGroup.HOME, groups.first().first)
        assertEquals(MenuGroup.ACCOUNT, groups.last().first)
        assertEquals(listOf(MenuIds.PROFILE), groups.last().second.map { it.id })
        assertEquals(MenuGroup.MY_WORK, MenuGroups.groupOf(MenuIds.MY_SALARY))
        val teaching = groups.first { it.first == MenuGroup.TEACHING }.second.map { it.id }
        assertTrue(teaching.containsAll(listOf(MenuIds.CLASSES, MenuIds.TIMETABLE, MenuIds.ATTENDANCE, MenuIds.DIARY)))
        // The drawer lists every destination, bottom-bar ones included.
        assertEquals(fullMenu(RoleKey.TEACHER).size, groups.sumOf { it.second.size })
    }
}
