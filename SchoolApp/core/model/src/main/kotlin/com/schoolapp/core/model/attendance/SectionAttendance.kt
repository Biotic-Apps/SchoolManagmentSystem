package com.schoolapp.core.model.attendance

/** Principal's per-section view of a day (`/attendance/summary`). */
data class SectionAttendance(
    val sectionId: String,
    val className: String?,
    val sectionName: String?,
    val status: RegisterStatus,
    val present: Int,
    val absent: Int,
    val late: Int,
    val leave: Int,
    val total: Int,
)

/** A section with no submitted register for the day (`/attendance/unmarked`). */
data class UnmarkedSection(val sectionId: String, val className: String?, val sectionName: String?)
