package com.schoolapp.core.model

/** System roles, in the server's default-context priority order. */
enum class RoleKey : RoleRef {
    SUPER_ADMIN,
    PRINCIPAL,
    COORDINATOR,
    HEAD_TEACHER,
    TEACHER,
    HELPER,
    ACCOUNTANT,
    PARENT,
    ;

    override val key: String get() = name

    companion object {
        fun fromKey(key: String): RoleKey? = entries.firstOrNull { it.name == key }
    }
}
