package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.calendar.StudentCalendarRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.organisation.CalendarEvent
import java.time.LocalDate
import javax.inject.Inject

/** Holidays and vacations of the shown week, by date; failures just mean "no holidays known". */
internal class WeekHolidays @Inject constructor(
    private val organisation: OrganisationRepository,
    private val studentCalendar: StudentCalendarRepository,
) {
    suspend fun forBranch(branchId: String?, week: WeekDates): Map<LocalDate, String> {
        branchId ?: return emptyMap()
        val result = organisation.calendar(branchId, week.monday.toString(), week.sunday.toString())
        return (result as? AppResult.Success)?.data?.let { byDate(it, week) }.orEmpty()
    }

    suspend fun forChild(childId: String, week: WeekDates): Map<LocalDate, String> {
        val result = studentCalendar.upcoming(childId, week.monday.toString(), week.sunday.toString())
        return (result as? AppResult.Success)?.data?.let { byDate(it, week) }.orEmpty()
    }

    companion object {
        private val CLOSED_TYPES = setOf("HOLIDAY", "VACATION")

        internal fun byDate(events: List<CalendarEvent>, week: WeekDates): Map<LocalDate, String> = buildMap {
            events.filter { it.type in CLOSED_TYPES }.forEach { event ->
                val start = event.startDate?.let(::parse) ?: return@forEach
                val end = event.endDate?.let(::parse) ?: start
                generateSequence(maxOf(start, week.monday)) { it.plusDays(1) }
                    .takeWhile { !it.isAfter(minOf(end, week.sunday)) }
                    .forEach { putIfAbsent(it, event.title) }
            }
        }

        private fun parse(value: String): LocalDate? = runCatching { LocalDate.parse(value.take(10)) }.getOrNull()
    }
}
