package com.schoolapp.core.model.users

/** A row of Principals & Admin Users. [status] is ACTIVE or DISABLED; [roles] are role keys. */
data class AdminUser(
    val id: String,
    val name: String,
    val email: String?,
    val phone: String?,
    val status: String,
    val roles: List<String>,
    val branchNames: List<String>,
    val lastLoginAt: String?,
    /** Set while sign-in is locked after failed attempts (ISO timestamp). */
    val lockedUntil: String?,
) {
    val isActive: Boolean get() = status == STATUS_ACTIVE

    companion object {
        const val STATUS_ACTIVE = "ACTIVE"
        const val STATUS_DISABLED = "DISABLED"
    }
}

data class AdminUserPage(val items: List<AdminUser>, val total: Int?, val page: Int, val pageSize: Int) {
    val hasMore: Boolean get() = total?.let { page * pageSize < it } ?: (items.size == pageSize)
}

data class AdminUserDetail(
    val user: AdminUser,
    val assignments: List<UserAssignment>,
    val mustChangePassword: Boolean,
    val createdAt: String?,
)

/** One role grant; [scopeType] GLOBAL, SCHOOL, BRANCH… [validUntil] ISO timestamp or null (permanent). */
data class UserAssignment(
    val id: String,
    val roleKey: String,
    val roleName: String?,
    val scopeType: String,
    val schoolId: String?,
    val schoolName: String?,
    val branchId: String?,
    val branchName: String?,
    val validUntil: String?,
)

/** A role to grant: [schoolId] for SCHOOL scope, [branchId] for BRANCH scope; [validUntil] "yyyy-MM-dd" or null. */
data class AssignmentRequest(
    val roleKey: String,
    val scopeType: String,
    val schoolId: String?,
    val branchId: String?,
    val validUntil: String?,
)

data class NewUser(
    val name: String,
    val email: String?,
    val phone: String?,
    val password: String?,
    val assignments: List<AssignmentRequest>,
)

data class UserContactUpdate(val name: String, val email: String?, val phone: String?)

/** Created user plus the one-time temporary password when the server generated it. */
data class CreatedUser(val detail: AdminUserDetail, val temporaryPassword: String?)

/** A custom (non-system) role that can be assigned. */
data class AssignableRole(val key: String, val name: String)
