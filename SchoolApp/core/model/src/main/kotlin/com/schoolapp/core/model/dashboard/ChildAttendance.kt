package com.schoolapp.core.model.dashboard

import com.schoolapp.core.model.attendance.AttendanceStatus

/** [today] null = not marked yet (never shown as absent). */
data class ChildAttendance(val today: AttendanceStatus?, val month: AttendanceMonth?)

/** Counts for [month] (`YYYY-MM`); [percent] null when no day was marked yet. */
data class AttendanceMonth(
    val month: String,
    val present: Int,
    val absent: Int,
    val late: Int,
    val leave: Int,
    val halfDay: Int,
    val percent: Double?,
)
