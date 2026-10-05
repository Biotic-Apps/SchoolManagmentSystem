package com.schoolapp.core.model

/** A role key from the server: a system [RoleKey] or a [CustomRole] created in Roles & Permissions. */
sealed interface RoleRef {
    val key: String

    companion object {
        fun of(key: String): RoleRef = RoleKey.fromKey(key) ?: CustomRole(key)
    }
}

/** Non-system role (key `CUSTOM_<slug>`); its menu is derived from permissions alone. */
data class CustomRole(override val key: String) : RoleRef
