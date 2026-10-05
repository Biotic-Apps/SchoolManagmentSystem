package com.schoolapp.core.data.auth

import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.Permission
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User
import com.schoolapp.core.network.dto.me.AssignmentDto
import com.schoolapp.core.network.dto.me.ChildDto
import com.schoolapp.core.network.dto.me.MeDto
import com.schoolapp.core.network.dto.me.MeUserDto

/**
 * The server's `activeRole` is authoritative because `permissions` belong to it.
 * Returns null when the user holds no role at all.
 */
internal fun MeDto.toSessionContext(preferredChildId: String?): SessionContext? {
    val roleAssignments = assignments.mapNotNull { it.toModel() }
    val heldRoles = (roles.map(RoleRef::of) + roleAssignments.map { it.role }).distinct()
    val active = activeRole?.takeIf { it.isNotBlank() }?.let(RoleRef::of) ?: heldRoles.firstOrNull() ?: return null
    val childSummaries = children.map { it.toModel() }
    return SessionContext(
        user = user.toModel(),
        assignments = roleAssignments,
        activeRole = active,
        permissions = permissions.map(::Permission).toSet(),
        children = childSummaries,
        activeChildId = preferredChildId?.takeIf { id -> childSummaries.any { it.id == id } }
            ?: childSummaries.firstOrNull()?.id,
        roles = (heldRoles + active).distinct(),
    )
}

private fun MeUserDto.toModel() =
    User(id = id, fullName = name, email = email, phone = phone, mustChangePassword = mustChangePassword)

private fun AssignmentDto.toModel(): RoleAssignment? {
    val scope = ScopeType.entries.firstOrNull { it.name == scopeType } ?: return null
    return RoleAssignment(
        id = id,
        role = RoleRef.of(role),
        scopeType = scope,
        roleName = roleName,
        schoolId = schoolId,
        schoolName = schoolName,
        branchId = branchId,
        branchName = branchName,
        validUntil = validUntil,
    )
}

private fun ChildDto.toModel() = ChildSummary(id, name, className, sectionName, branchName)
