package com.schoolapp.core.model.timetable

/**
 * One period from `/timetables/me`; times are API `HH:mm` from that day's schedule, [day] is ISO 1 (Mon)
 * to 7 (Sun), [periodNumber] is "Period N" among the day's teaching periods (null on older servers).
 */
data class TeacherSlot(
    val date: String?,
    val day: Int,
    val periodIndex: Int,
    val startTime: String?,
    val endTime: String?,
    val sectionName: String?,
    val className: String?,
    val subjectName: String?,
    val staffName: String?,
    val roomName: String?,
    val isSubstitute: Boolean,
    val periodNumber: Int? = null,
)
