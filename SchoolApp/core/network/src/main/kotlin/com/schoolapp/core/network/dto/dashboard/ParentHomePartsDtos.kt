package com.schoolapp.core.network.dto.dashboard

import kotlinx.serialization.Serializable

/** [today] is PRESENT, ABSENT, LATE, LEAVE, HALF_DAY or UNMARKED. */
@Serializable
data class ParentAttendanceDto(val today: String? = null, val month: AttendanceMonthDto? = null)

@Serializable
data class AttendanceMonthDto(
    val month: String,
    val present: Int = 0,
    val absent: Int = 0,
    val late: Int = 0,
    val leave: Int = 0,
    val halfDay: Int = 0,
    val percent: Double? = null,
)

@Serializable
data class LatestResultDto(
    val examId: String,
    val examName: String,
    val percent: Double = 0.0,
    val grade: String = "",
    val position: Int? = null,
    val passed: Boolean = true,
    val publishedAt: String? = null,
)

@Serializable
data class HomeworkDueDto(val dueCount: Int = 0, val nextDueDate: String? = null)

/** [kind]: ACTIVITY, EVENT, HOLIDAY, VACATION or DEADLINE. */
@Serializable
data class ParentEventDto(
    val id: String,
    val kind: String? = null,
    val title: String,
    val startDate: String? = null,
    val endDate: String? = null,
)
