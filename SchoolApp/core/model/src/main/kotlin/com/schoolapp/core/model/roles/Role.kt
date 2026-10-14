package com.schoolapp.core.model.roles

/** A system or custom role with the permission keys it grants. */
data class Role(
    val id: String,
    val key: String,
    val name: String,
    val isSystem: Boolean,
    val schoolId: String?,
    val permissions: List<String>,
    val assignmentCount: Int,
) {
    /** Only custom roles nobody holds can be deleted (the API refuses the rest). */
    val isDeletable: Boolean get() = !isSystem && assignmentCount == 0
}

/** One entry of the permission catalogue, e.g. `attendance.submit`. */
data class PermissionInfo(
    val key: String,
    val module: String,
    val action: String,
    val description: String,
)

/** Create/update payload; null fields are not sent. */
data class RoleInput(
    val name: String? = null,
    val schoolId: String? = null,
    val permissions: List<String>? = null,
)

data class SchoolOption(val id: String, val name: String)
