package com.schoolapp.core.model.attendance

data class StudentAttendance(val days: List<AttendanceDay>, val summary: AttendanceSummary)

data class AttendanceDay(val date: String, val status: AttendanceStatus?, val remark: String?)

/** Unmarked days are counted separately and never as absent. */
data class AttendanceSummary(
    val present: Int,
    val absent: Int,
    val late: Int,
    val leave: Int,
    val halfDay: Int,
    val unmarked: Int,
    val percent: Int,
)
