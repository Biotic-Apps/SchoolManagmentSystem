package com.schoolapp.core.model.exams.grading

/** One grade band, e.g. A+ for 90–100 %. */
data class GradeBand(
    val grade: String,
    val minPercent: Double,
    val maxPercent: Double,
    val remark: String?,
    val gradePoint: Double?,
)

enum class GradingSchemeStatus { DRAFT, APPROVED }

/** A session's grading scheme; exams point at one. */
data class GradingScheme(
    val id: String,
    val schoolId: String?,
    val sessionId: String?,
    val name: String,
    val passPercent: Double,
    val status: GradingSchemeStatus,
    val approvedAt: String?,
    val bands: List<GradeBand>,
)

/** Create / update body; [schoolId] and [sessionId] are only sent on create. */
data class GradingSchemeInput(
    val schoolId: String,
    val sessionId: String,
    val name: String,
    val passPercent: Double,
    val bands: List<GradeBand>,
)
