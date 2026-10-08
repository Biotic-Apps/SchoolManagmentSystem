package com.schoolapp.core.network.dto.organisation

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/** `GET /classes/overview` item. */
@Serializable
data class ClassOverviewDto(
    val id: String,
    val name: String,
    val levelOrder: Int? = null,
    val status: String? = null,
    val studentCount: Int = 0,
    val capacity: Int? = null,
    val sections: List<SectionOverviewDto> = emptyList(),
    val subjects: List<ClassSubjectRefDto> = emptyList(),
    val issues: List<String> = emptyList(),
    val unallocated: Int = 0,
)

@Serializable
data class SectionOverviewDto(
    val id: String,
    val name: String,
    val group: String? = null,
    val studentCount: Int = 0,
    val capacity: Int? = null,
    val room: IdNameDto? = null,
    val classTeacher: IdNameDto? = null,
    val timetable: String? = null,
)

@Serializable
data class ClassSubjectRefDto(
    val id: String,
    val name: String,
    val periodsPerWeek: Int? = null,
    val group: String? = null,
)
