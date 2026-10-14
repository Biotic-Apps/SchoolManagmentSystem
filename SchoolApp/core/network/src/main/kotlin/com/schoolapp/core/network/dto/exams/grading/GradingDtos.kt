package com.schoolapp.core.network.dto.exams.grading

import kotlinx.serialization.Serializable

@Serializable
data class GradeBandDto(
    val grade: String = "",
    val minPercent: Double = 0.0,
    val maxPercent: Double = 0.0,
    val remark: String? = null,
    val gradePoint: Double? = null,
)

@Serializable
data class GradingSchemeDto(
    val id: String,
    val schoolId: String? = null,
    val sessionId: String? = null,
    val name: String = "",
    val passPercent: Double = 0.0,
    val status: String? = null,
    val approvedAt: String? = null,
    val bands: List<GradeBandDto> = emptyList(),
)

@Serializable
data class GradingSchemeCreateBodyDto(
    val schoolId: String,
    val sessionId: String,
    val name: String,
    val passPercent: Double,
    val bands: List<GradeBandDto>,
)

@Serializable
data class GradingSchemeUpdateBodyDto(
    val name: String,
    val passPercent: Double,
    val bands: List<GradeBandDto>,
)
