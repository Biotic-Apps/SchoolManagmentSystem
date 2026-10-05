package com.schoolapp.core.model

/** Snapshot of `/me` for the active role context; [permissions] belong to [activeRole] only. */
data class SessionContext(
    val user: User,
    val assignments: List<RoleAssignment>,
    val activeRole: RoleRef,
    val permissions: Set<Permission>,
    val children: List<ChildSummary> = emptyList(),
    val activeChildId: String? = null,
    val roles: List<RoleRef> = assignments.map { it.role }.distinct(),
) {
    val availableRoles: List<RoleRef>
        get() = roles

    val activeChild: ChildSummary?
        get() = children.firstOrNull { it.id == activeChildId } ?: children.firstOrNull()

    val activeAssignments: List<RoleAssignment>
        get() = assignments.filter { it.role == activeRole }

    fun has(permission: Permission): Boolean = permission in permissions

    fun has(permissionKey: String): Boolean = Permission(permissionKey) in permissions

    /** Display name the server gave this role, if any (used for custom roles). */
    fun roleName(role: RoleRef): String? = assignments.firstOrNull { it.role == role }?.roleName
}
