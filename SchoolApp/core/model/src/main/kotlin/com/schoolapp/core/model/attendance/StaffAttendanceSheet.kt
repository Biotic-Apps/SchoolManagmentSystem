package com.schoolapp.core.model.attendance

/** One branch's staff register for a day (`/staff-attendance`); every active staff member is listed, marked or not. */
data class StaffAttendanceSheet(
    val branchId: String,
    val date: String,
    val entries: List<StaffRosterEntry>,
)

/** One staff member on the sheet; check times are API `HH:mm`. */
data class StaffRosterEntry(
    val staffId: String,
    val name: String,
    val designation: String?,
    val photoUrl: String?,
    val status: AttendanceStatus?,
    val checkIn: String?,
    val checkOut: String?,
    val remark: String?,
)

/** One mark sent with `PUT /staff-attendance`. */
data class StaffMark(
    val staffId: String,
    val status: AttendanceStatus,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val remark: String? = null,
)
