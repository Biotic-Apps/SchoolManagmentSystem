package com.schoolapp.core.network.dto.staff

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class StaffSummaryDto(
    val id: String,
    val userId: String? = null,
    val name: String,
    val photoUrl: String? = null,
    val employeeNo: String? = null,
    val designation: String? = null,
    val branchName: String? = null,
    val status: String? = null,
    val roles: List<String> = emptyList(),
    val requiresReview: Boolean = false,
    val reviewer: IdNameDto? = null,
    val sectionCount: Int = 0,
    val subjectCount: Int = 0,
)
