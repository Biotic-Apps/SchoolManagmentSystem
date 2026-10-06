package com.schoolapp.core.model.timetable

data class SectionTimetable(
    val sectionId: String,
    val status: String?,
    val version: Int?,
    val publishedAt: String?,
    val slots: List<TimetableSlot>,
    val periods: List<Period>,
)
