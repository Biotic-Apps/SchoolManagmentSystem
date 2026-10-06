package com.schoolapp.core.model.timetable

data class TimetableSlot(
    val day: Int,
    val periodIndex: Int,
    val subjectName: String?,
    val staffName: String?,
    val roomName: String?,
)
