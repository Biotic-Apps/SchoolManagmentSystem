package com.schoolapp.core.network.dto.syllabus

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.timetable.SectionRefDto
import kotlinx.serialization.Serializable

/** Accepts flat (sectionName, subjectName) or nested (section, subject) fields. */
@Serializable
data class CoverageDto(
    val sectionId: String? = null,
    val sectionName: String? = null,
    val className: String? = null,
    val subjectId: String? = null,
    val subjectName: String? = null,
    val section: SectionRefDto? = null,
    val subject: IdNameDto? = null,
    val total: Int = 0,
    val completed: Int = 0,
    val delayed: Int = 0,
    val percent: Double = 0.0,
)
