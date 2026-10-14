package com.schoolapp.feature.admin.users

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext

/** Same checks as the web users page; the API enforces them again (grant-rules.ts). */
data class UserPermissions(
    val canAdd: Boolean = false,
    val canEdit: Boolean = false,
    val canViewRoles: Boolean = false,
    val canViewSchools: Boolean = false,
    val isSuperAdmin: Boolean = false,
    val currentUserId: String? = null,
) {
    fun isSelf(userId: String): Boolean = userId == currentUserId

    companion object {
        fun of(session: SessionContext?): UserPermissions {
            if (session == null) return UserPermissions()
            return UserPermissions(
                canAdd = session.has("users.add"),
                canEdit = session.has("users.edit"),
                canViewRoles = session.has("roles.view"),
                canViewSchools = session.has("schools.view"),
                isSuperAdmin = session.activeRole == RoleKey.SUPER_ADMIN,
                currentUserId = session.user.id,
            )
        }
    }
}
