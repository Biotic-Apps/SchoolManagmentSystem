package com.schoolapp.feature.timetable

import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.timetable.Period
import java.time.LocalDate
import java.time.LocalTime

/** Pure week/day planning: merges lessons into the bell schedule and finds the running and next lesson. */
internal object DayPlanner {

    /** Mon–Sat, the usual Pakistani school week, when the server sends no working days. */
    val DEFAULT_WORKING_DAYS = (1..6).toList()

    /**
     * The week's days: [workingDays] (or Mon–Sat) plus any day that has lessons. Each day lists its bell
     * rows (lesson, break or free) when [periodsFor] knows the schedule, else the lessons alone.
     */
    fun week(
        lessons: List<ScheduleRow>,
        workingDays: List<Int>,
        periodsFor: (Int) -> List<Period>,
        dateFor: (Int) -> LocalDate?,
        holidays: Map<LocalDate, String> = emptyMap(),
    ): List<DayPlan> {
        val working = workingDays.ifEmpty { DEFAULT_WORKING_DAYS }
        val byDay = lessons.groupBy { it.day }
        return (working + byDay.keys).distinct().sorted().map { day ->
            val date = dateFor(day)
            DayPlan(
                day = day,
                date = date,
                rows = merge(day, periodsFor(day), byDay[day].orEmpty()),
                holiday = date?.let(holidays::get),
                isWorkingDay = day in working,
            )
        }
    }

    /** Bell rows with lessons placed; lessons on unknown periods are kept and ordered by time. */
    fun merge(day: Int, periods: List<Period>, lessons: List<ScheduleRow>): List<ScheduleRow> {
        if (lessons.isEmpty() && periods.none { !it.isBreak }) return emptyList()
        val byIndex = lessons.groupBy { it.periodIndex }
        val known = periods.flatMap { period ->
            byIndex[period.index]?.map { it.withPeriod(period) } ?: listOf(ScheduleBuilder.emptyRow(day, period))
        }
        val indexes = periods.map { it.index }.toSet()
        val extra = lessons.filter { it.periodIndex !in indexes }
        return if (extra.isEmpty()) known else (known + extra).sortedWith(compareBy({ it.startTime ?: "99" }, { it.periodIndex }))
    }

    /** Fills a lesson's missing time / number from its bell row (week views send times per slot). */
    private fun ScheduleRow.withPeriod(period: Period): ScheduleRow = copy(
        startTime = startTime ?: period.startTime,
        endTime = endTime ?: period.endTime,
        timeRange = timeRange.ifBlank { ScheduleBuilder.timeRange(period.startTime, period.endTime) },
        periodNumber = periodNumber ?: period.number,
    )

    /** Row keys marked "Now" (any running row) and "Next" (the next lesson after now) for today's rows. */
    fun markers(rows: List<ScheduleRow>, now: LocalTime): Map<String, RowMarker> {
        val current = rows.firstOrNull { it.covers(now) }
        val next = rows.firstOrNull { row -> row.isLesson && row.startTime?.let(TimeFormat::parseTime)?.isAfter(now) == true }
        return buildMap {
            current?.let { put(it.key, RowMarker.NOW) }
            next?.takeIf { it.key != current?.key }?.let { put(it.key, RowMarker.NEXT) }
        }
    }

    private fun ScheduleRow.covers(now: LocalTime): Boolean {
        val start = startTime?.let(TimeFormat::parseTime) ?: return false
        val end = endTime?.let(TimeFormat::parseTime) ?: return false
        return !now.isBefore(start) && now.isBefore(end)
    }
}
