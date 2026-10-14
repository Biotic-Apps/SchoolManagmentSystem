package com.schoolapp.core.network.users

import kotlinx.serialization.Serializable

/** API UserSummaryDto (list row). */
@Serializable
data class UserSummaryDto(
    val id: String,
    val name: String = "",
    val email: String? = null,
    val phone: String? = null,
    val status: String = "ACTIVE",
    val roles: List<String> = emptyList(),
    val branchNames: List<String> = emptyList(),
    val lastLoginAt: String? = null,
    val lockedUntil: String? = null,
)

/** API UserDetailDto / CreatedUserDto (`temporaryPassword` only right after creating). */
@Serializable
data class UserDetailDto(
    val id: String,
    val name: String = "",
    val email: String? = null,
    val phone: String? = null,
    val status: String = "ACTIVE",
    val roles: List<String> = emptyList(),
    val branchNames: List<String> = emptyList(),
    val lastLoginAt: String? = null,
    val lockedUntil: String? = null,
    val assignments: List<UserAssignmentDto> = emptyList(),
    val mustChangePassword: Boolean = false,
    val createdAt: String? = null,
    val temporaryPassword: String? = null,
)

@Serializable
data class UserAssignmentDto(
    val id: String,
    val role: String = "",
    val roleName: String? = null,
    val scopeType: String = "",
    val schoolId: String? = null,
    val schoolName: String? = null,
    val branchId: String? = null,
    val branchName: String? = null,
    val validUntil: String? = null,
)

@Serializable
data class TemporaryPasswordDto(val temporaryPassword: String)

@Serializable
data class AssignableRoleDto(val key: String, val name: String = "", val isSystem: Boolean = false)

@Serializable
data class AssignmentBody(
    val roleKey: String,
    val scopeType: String,
    val schoolId: String? = null,
    val branchId: String? = null,
    val validUntil: String? = null,
)

@Serializable
data class CreateUserBody(
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val password: String? = null,
    val assignments: List<AssignmentBody>,
)
