package com.schoolapp.core.network.dto.organisation

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class BranchDto(
    val id: String,
    val schoolId: String? = null,
    val schoolName: String? = null,
    val code: String? = null,
    val name: String,
    val address: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val timings: BranchTimingsDto? = null,
    val workingDays: List<Int> = emptyList(),
    val principal: IdNameDto? = null,
    val status: String? = null,
    val createdAt: String? = null,
)
