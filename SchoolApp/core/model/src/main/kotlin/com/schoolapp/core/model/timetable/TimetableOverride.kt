package com.schoolapp.core.model.timetable

/**
 * A day substitution: [substituteName] covers period [periodIndex] of a section on [date] (`YYYY-MM-DD`)
 * instead of [originalTeacherName]. [className] / [sectionName] are null when the server omits them.
 */
data class TimetableOverride(
    val id: String,
    val sectionId: String,
    val date: String,
    val periodIndex: Int,
    val substituteStaffId: String?,
    val substituteName: String?,
    val originalTeacherName: String?,
    val reason: String?,
    val className: String? = null,
    val sectionName: String? = null,
)

/** New substitution; [reason] is 3–300 characters. */
data class OverrideInput(
    val sectionId: String,
    val date: String,
    val periodIndex: Int,
    val substituteStaffId: String,
    val reason: String,
)
