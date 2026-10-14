package com.schoolapp.feature.admin.roles

import androidx.annotation.StringRes
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.roles.Role
import com.schoolapp.feature.admin.R

/** Permission keys the web panel checks on this page. */
object RolePermissions {
    const val ADD = "roles.add"
    const val EDIT = "roles.edit"
    const val DELETE = "roles.delete"
    const val SCHOOLS_VIEW = "schools.view"
}

/** What the current user may change on a role (system roles are restricted). */
data class RoleEditRights(val name: Boolean, val permissions: Boolean) {
    val readOnly: Boolean get() = !name && !permissions
}

/** System roles: name/key fixed, permissions editable by SUPER_ADMIN only. */
fun roleEditRights(role: Role?, session: SessionContext?): RoleEditRights {
    if (role == null) return RoleEditRights(name = true, permissions = true)
    if (session?.has(RolePermissions.EDIT) != true) return RoleEditRights(name = false, permissions = false)
    if (!role.isSystem) return RoleEditRights(name = true, permissions = true)
    return RoleEditRights(name = false, permissions = session.activeRole == RoleKey.SUPER_ADMIN)
}

@StringRes
fun roleReadOnlyNotice(role: Role?, rights: RoleEditRights, session: SessionContext?): Int? = when {
    role == null || rights.permissions -> null
    session?.has(RolePermissions.EDIT) != true -> R.string.roles_notice_view_only
    else -> R.string.roles_notice_system
}

/** Preview of the server-generated key: CUSTOM_<slug>. */
fun customRoleKeyPreview(name: String): String {
    val slug = name.trim().uppercase().replace(Regex("[^A-Z0-9]+"), "_").trim('_')
    return "CUSTOM_${slug.ifEmpty { "…" }}"
}

const val ROLE_NAME_MIN = 2
const val ROLE_NAME_MAX = 60
