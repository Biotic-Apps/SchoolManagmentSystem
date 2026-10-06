package com.schoolapp.core.network.dto.staff

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class StaffAssignmentDto(
    val id: String,
    val kind: String,
    val sessionId: String? = null,
    val sectionId: String? = null,
    val sectionName: String? = null,
    val className: String? = null,
    val subjectId: String? = null,
    val subjectName: String? = null,
    val responsibleStaff: IdNameDto? = null,
    val validUntil: String? = null,
    val isSubstitute: Boolean = false,
)

@Serializable
data class StaffWorkloadDto(val periodsPerWeek: Int = 0, val sections: Int = 0, val subjects: Int = 0)
