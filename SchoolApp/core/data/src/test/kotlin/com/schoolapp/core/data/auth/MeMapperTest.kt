package com.schoolapp.core.data.auth

import com.schoolapp.core.model.CustomRole
import com.schoolapp.core.model.Permission
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.network.dto.me.AssignmentDto
import com.schoolapp.core.network.dto.me.ChildDto
import com.schoolapp.core.network.dto.me.MeDto
import com.schoolapp.core.network.dto.me.MeUserDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class MeMapperTest {

    private val me = MeDto(
        user = MeUserDto("u1", "Sara Ali", mustChangePassword = true),
        activeRole = "PARENT",
        roles = listOf("TEACHER", "PARENT"),
        permissions = listOf("dashboard.view", "attendance.view"),
        assignments = listOf(
            AssignmentDto("a1", "TEACHER", scopeType = "SECTION", branchId = "b1", branchName = "Main"),
            AssignmentDto("a2", "PARENT", scopeType = "GUARDIAN"),
            AssignmentDto("a3", "TEACHER", scopeType = "UNKNOWN_SCOPE"),
        ),
        children = listOf(ChildDto("c1", "Ayesha"), ChildDto("c2", "Omar")),
    )

    @Test
    fun server_active_role_is_authoritative() {
        val context = me.toSessionContext(preferredChildId = null)!!
        assertEquals(RoleKey.PARENT, context.activeRole)
        assertEquals(listOf(RoleKey.TEACHER, RoleKey.PARENT), context.availableRoles)
        assertTrue(context.has(Permission("attendance.view")))
        assertTrue(context.user.mustChangePassword)
        assertEquals("c1", context.activeChildId)
    }

    @Test
    fun preferred_child_wins_when_valid_and_unknown_scopes_are_skipped() {
        val context = me.toSessionContext("c2")!!
        assertEquals("c2", context.activeChildId)
        assertEquals(listOf("a1", "a2"), context.assignments.map { it.id })
        assertEquals("c1", me.toSessionContext("unknown")!!.activeChildId)
    }

    @Test
    fun custom_roles_map_to_custom_role_with_server_name() {
        val custom = me.copy(
            activeRole = "CUSTOM_FRONT_DESK",
            roles = listOf("TEACHER", "CUSTOM_FRONT_DESK"),
            assignments = me.assignments + AssignmentDto("a4", "CUSTOM_FRONT_DESK", roleName = "Front Desk", scopeType = "BRANCH"),
        )
        val context = custom.toSessionContext(null)!!
        assertEquals(CustomRole("CUSTOM_FRONT_DESK"), context.activeRole)
        assertTrue(CustomRole("CUSTOM_FRONT_DESK") in context.availableRoles)
        assertEquals("Front Desk", context.roleName(context.activeRole))
        assertEquals(listOf("a4"), context.activeAssignments.map { it.id })
    }

    @Test
    fun falls_back_to_first_held_role_when_active_role_missing() {
        assertEquals(RoleKey.TEACHER, me.copy(activeRole = null).toSessionContext(null)!!.activeRole)
    }

    @Test
    fun returns_null_without_any_role() {
        assertNull(me.copy(activeRole = null, roles = emptyList(), assignments = emptyList()).toSessionContext(null))
    }
}
