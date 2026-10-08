package com.schoolapp.feature.timetable.bell

import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.BellScheduleInput
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.PeriodInput

/** Bell schedule maths shared with the web: generator, validation, form ↔ API conversion. */
internal object BellRules {
    const val DEFAULT_BREAK = "Break"

    fun minutes(time: String): Int = TimeFormat.parseTime(time)?.let { it.hour * 60 + it.minute } ?: 0

    fun addMinutes(time: String, add: Int): String {
        val total = (minutes(time) + add).coerceIn(0, 23 * 60 + 59)
        return "%02d:%02d".format(java.util.Locale.ENGLISH, total / 60, total % 60)
    }

    /** Rows in order: [count] teaching periods with one break after period [breakAfter] (0 = none). */
    fun generate(start: String, periodMinutes: Int, count: Int, breakAfter: Int, breakMinutes: Int): List<BellRow> {
        val rows = mutableListOf<BellRow>()
        var time = start
        for (period in 1..count) {
            val end = addMinutes(time, periodMinutes)
            rows += BellRow(time, end)
            time = end
            if (period == breakAfter && breakMinutes > 0 && period < count) {
                val breakEnd = addMinutes(time, breakMinutes)
                rows += BellRow(time, breakEnd, isBreak = true, label = DEFAULT_BREAK)
                time = breakEnd
            }
        }
        return rows
    }

    /** End after start; start not before the previous row ends. */
    fun problems(rows: List<BellRow>): Map<Int, RowProblem> = rows.mapIndexedNotNull { index, row ->
        val previous = rows.getOrNull(index - 1)
        when {
            minutes(row.endTime) <= minutes(row.startTime) -> index to RowProblem.END_BEFORE_START
            previous != null && minutes(row.startTime) < minutes(previous.endTime) -> index to RowProblem.OVERLAPS_PREVIOUS
            else -> null
        }
    }.toMap()

    /** A new row starts when the last one ends and lasts as long as it did (40 minutes after a break). */
    fun nextRow(last: BellRow?): BellRow {
        val start = last?.endTime ?: "08:00"
        val length = if (last != null && !last.isBreak) minutes(last.endTime) - minutes(last.startTime) else DEFAULT_LENGTH
        return BellRow(start, addMinutes(start, length))
    }

    fun fromSchedule(schedule: BellSchedule): List<DaySchedule> {
        val base = DaySchedule(0, schedule.default.toRows().ifEmpty { generate("08:00", 40, 8, 4, 30) })
        val days = schedule.days.filterValues { it.isNotEmpty() }.toSortedMap().map { (day, rows) -> DaySchedule(day, rows.toRows()) }
        return listOf(base) + days
    }

    fun toInput(schedules: List<DaySchedule>, dropLessons: Boolean): BellScheduleInput {
        val base = schedules.first { it.day == 0 }
        return BellScheduleInput(
            default = base.rows.toInputs(),
            days = schedules.filter { it.day != 0 }.associate { it.day to it.rows.toInputs() },
            dropLessons = dropLessons,
        )
    }

    private fun List<Period>.toRows() = sortedBy { it.index }.map {
        BellRow(it.startTime, it.endTime, it.isBreak, if (it.isBreak) it.label ?: DEFAULT_BREAK else "")
    }

    private fun List<BellRow>.toInputs() = mapIndexed { index, row ->
        PeriodInput(index + 1, row.startTime, row.endTime, row.isBreak, row.label.trim().ifEmpty { DEFAULT_BREAK }.takeIf { row.isBreak })
    }

    private const val DEFAULT_LENGTH = 40
}
