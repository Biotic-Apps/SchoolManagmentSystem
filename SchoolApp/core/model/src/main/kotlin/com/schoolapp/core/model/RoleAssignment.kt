package com.schoolapp.core.model

data class RoleAssignment(
    val id: String,
    val role: RoleRef,
    val scopeType: ScopeType,
    val roleName: String? = null,
    val schoolId: String? = null,
    val schoolName: String? = null,
    val branchId: String? = null,
    val branchName: String? = null,
    val validUntil: String? = null,
)
