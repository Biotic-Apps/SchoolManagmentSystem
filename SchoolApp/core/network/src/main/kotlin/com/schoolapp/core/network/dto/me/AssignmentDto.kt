package com.schoolapp.core.network.dto.me

import kotlinx.serialization.Serializable

@Serializable
data class AssignmentDto(
    val id: String,
    val role: String,
    val roleName: String? = null,
    val scopeType: String,
    val schoolId: String? = null,
    val schoolName: String? = null,
    val branchId: String? = null,
    val branchName: String? = null,
    val validUntil: String? = null,
)
