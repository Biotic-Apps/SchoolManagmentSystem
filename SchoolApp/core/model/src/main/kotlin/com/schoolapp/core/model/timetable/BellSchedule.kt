package com.schoolapp.core.model.timetable

/** A branch's time slots: [default] rows for every working day plus weekday-specific [days] (e.g. Friday = 5). */
data class BellSchedule(
    val workingDays: List<Int>,
    val default: List<Period>,
    val days: Map<Int, List<Period>> = emptyMap(),
) {
    fun periodsFor(day: Int): List<Period> = days[day]?.takeIf { it.isNotEmpty() } ?: default
}
