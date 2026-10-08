package com.schoolapp.core.network.dto.staff

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class StaffDetailDto(
    val id: String,
    val userId: String? = null,
    val name: String,
    val photoUrl: String? = null,
    val employeeNo: String? = null,
    val designation: String? = null,
    val branchId: String? = null,
    val branchName: String? = null,
    val status: String? = null,
    val roles: List<String> = emptyList(),
    val requiresReview: Boolean = false,
    val reviewer: IdNameDto? = null,
    val sectionCount: Int = 0,
    val subjectCount: Int = 0,
    val email: String? = null,
    val phone: String? = null,
    val cnic: String? = null,
    val qualification: String? = null,
    val joinDate: String? = null,
    val assignments: List<StaffAssignmentDto> = emptyList(),
)
