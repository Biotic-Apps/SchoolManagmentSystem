package com.schoolapp.core.network.dto.organisation

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class SectionDto(
    val id: String,
    val branchId: String? = null,
    val sessionId: String? = null,
    val classId: String? = null,
    val className: String? = null,
    val name: String,
    val capacity: Int? = null,
    val room: IdNameDto? = null,
    val classTeacher: IdNameDto? = null,
    val studentCount: Int = 0,
    val status: String? = null,
)
