package com.schoolapp.core.model.diary

/** Timetable slot with no published diary (`/diary/missing`). */
data class MissingDiary(
    val sectionId: String,
    val className: String?,
    val sectionName: String?,
    val subjectId: String?,
    val subjectName: String?,
)
