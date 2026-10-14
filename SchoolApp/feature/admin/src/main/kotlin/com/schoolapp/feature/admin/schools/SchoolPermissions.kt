package com.schoolapp.feature.admin.schools

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext

/** Same checks as the web `use-schools-page.ts`; the API enforces them again. */
data class SchoolPermissions(
    /** One-form setup also creates the branch and principal, so it needs all three grants. */
    val canSetup: Boolean = false,
    val canEdit: Boolean = false,
    val canArchive: Boolean = false,
    /** Permanent delete: super admin only. */
    val canDelete: Boolean = false,
) {
    companion object {
        fun of(session: SessionContext?): SchoolPermissions {
            if (session == null) return SchoolPermissions()
            val superAdmin = session.activeRole == RoleKey.SUPER_ADMIN
            val canArchive = session.has("schools.delete")
            return SchoolPermissions(
                canSetup = superAdmin && session.has("schools.add") && session.has("branches.add") && session.has("users.add"),
                canEdit = session.has("schools.edit"),
                canArchive = canArchive,
                canDelete = superAdmin && canArchive,
            )
        }
    }
}
