package com.schoolapp.core.model.timetable

/** One row of `PUT /branches/:id/bell-schedule`; [label] is only sent for breaks. */
data class PeriodInput(val index: Int, val startTime: String, val endTime: String, val isBreak: Boolean, val label: String?)

/** Default rows plus weekday variants (5 = Friday); [dropLessons] deletes lessons on removed periods. */
data class BellScheduleInput(
    val default: List<PeriodInput>,
    val days: Map<Int, List<PeriodInput>>,
    val dropLessons: Boolean = false,
)
