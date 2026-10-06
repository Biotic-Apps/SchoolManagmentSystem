package com.schoolapp.core.model.attendance

/** Own staff attendance (`/staff-attendance/me`); check times are API `HH:mm`. */
data class MyStaffAttendance(val days: List<StaffAttendanceDay>, val summary: AttendanceSummary?)

data class StaffAttendanceDay(
    val date: String,
    val status: AttendanceStatus?,
    val checkIn: String?,
    val checkOut: String?,
    val remark: String?,
)
