package com.schoolapp.core.network.dto.attendance

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class AttendanceTallyDto(
    val present: Int = 0,
    val absent: Int = 0,
    val late: Int = 0,
    val leave: Int = 0,
    val halfDay: Int = 0,
    val unmarked: Int = 0,
    val percent: Double? = null,
)

@Serializable
data class StudentAttendanceEntryDto(val date: String, val status: String? = null, val remark: String? = null)

/** `GET /attendance/students/:id`. */
@Serializable
data class StudentAttendanceDto(
    val entries: List<StudentAttendanceEntryDto> = emptyList(),
    val summary: AttendanceTallyDto? = null,
)

/** One row of `GET /attendance/summary`. */
@Serializable
data class SectionAttendanceDto(
    val sectionId: String,
    val className: String? = null,
    val sectionName: String? = null,
    val status: String? = null,
    val present: Int = 0,
    val absent: Int = 0,
    val late: Int = 0,
    val leave: Int = 0,
    val halfDay: Int = 0,
    val total: Int = 0,
)

/** One row of `GET /attendance/unmarked`. */
@Serializable
data class UnmarkedSectionDto(
    val sectionId: String,
    val className: String? = null,
    val sectionName: String? = null,
    val status: String? = null,
    val classTeacher: IdNameDto? = null,
)

/** One day of `GET /staff-attendance/me`. */
@Serializable
data class StaffAttendanceEntryDto(
    val date: String,
    val status: String? = null,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val remark: String? = null,
)
