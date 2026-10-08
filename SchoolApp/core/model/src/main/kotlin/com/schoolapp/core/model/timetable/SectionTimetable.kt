package com.schoolapp.core.model.timetable

/**
 * A section's week. [periods] is the default bell schedule; [dayPeriods] holds weekday-specific
 * schedules (e.g. a short Friday keyed by 5). [slots] are draft slots for editors, published ones otherwise.
 */
data class SectionTimetable(
    val sectionId: String,
    val status: String?,
    val version: Int?,
    val publishedAt: String?,
    val slots: List<TimetableSlot>,
    val periods: List<Period>,
    val state: TimetableState = TimetableState.EMPTY,
    val dayPeriods: Map<Int, List<Period>> = emptyMap(),
    /** The caller may edit this draft on the web (class teacher of the section, supervisors). */
    val canEdit: Boolean = false,
) {
    /** The schedule used on ISO [day]: its own rows when present, else the default rows. */
    fun periodsFor(day: Int): List<Period> = dayPeriods[day]?.takeIf { it.isNotEmpty() } ?: periods
}
