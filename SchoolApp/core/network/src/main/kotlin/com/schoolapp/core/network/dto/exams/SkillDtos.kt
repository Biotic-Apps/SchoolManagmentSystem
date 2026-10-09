package com.schoolapp.core.network.dto.exams

import kotlinx.serialization.Serializable

@Serializable
data class SkillItemDto(val id: String, val domain: String = "AFFECTIVE", val name: String = "", val sortOrder: Int = 0)

@Serializable
data class SkillLevelDto(val value: Int, val code: String = "", val label: String = "")

@Serializable
data class SkillStudentDto(
    val studentId: String,
    val name: String = "",
    val rollNo: Int? = null,
    val ratings: Map<String, Int> = emptyMap(),
)

@Serializable
data class SkillGridDto(
    val examId: String = "",
    val sectionId: String = "",
    val editable: Boolean = false,
    val items: List<SkillItemDto> = emptyList(),
    val scale: List<SkillLevelDto> = emptyList(),
    val students: List<SkillStudentDto> = emptyList(),
    val complete: Int = 0,
)

@Serializable
data class SkillRatingDto(val studentId: String, val itemId: String, val value: Int?)

@Serializable
data class SaveSkillRatingsBodyDto(val sectionId: String, val ratings: List<SkillRatingDto>)
