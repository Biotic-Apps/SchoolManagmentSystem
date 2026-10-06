package com.schoolapp.core.network.dto.timetable

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class TeacherSlotDto(
    val date: String? = null,
    val day: Int,
    val periodIndex: Int,
    val startTime: String? = null,
    val endTime: String? = null,
    val section: SectionRefDto? = null,
    val subject: IdNameDto? = null,
    val staff: IdNameDto? = null,
    val room: IdNameDto? = null,
    val isSubstitute: Boolean = false,
)

@Serializable
data class SectionRefDto(val id: String? = null, val name: String? = null, val className: String? = null)
