package com.schoolapp.core.network.roles

import kotlinx.serialization.Serializable

/** `GET /roles` row (API RoleDto). */
@Serializable
data class RoleDto(
    val id: String,
    val key: String = "",
    val name: String = "",
    val isSystem: Boolean = false,
    val schoolId: String? = null,
    val permissions: List<String> = emptyList(),
    val assignmentCount: Int = 0,
)

/** `GET /permissions` catalogue entry. */
@Serializable
data class PermissionDto(
    val key: String,
    val module: String = "",
    val action: String = "",
    val description: String = "",
)

/** Create/update body; null fields are left out (create needs name + permissions). */
@Serializable
data class RoleBodyDto(
    val name: String? = null,
    val schoolId: String? = null,
    val permissions: List<String>? = null,
)

/** Minimal school row for the role's school picker. */
@Serializable
data class SchoolOptionDto(val id: String, val name: String = "")
