package com.schoolapp.feature.admin.schools.setup.model

import java.time.LocalTime
import java.util.Locale

/** One bell row; [period] is 0 for the break. Times are "HH:mm". */
data class BellRow(val period: Int, val startTime: String, val endTime: String) {
    val isBreak: Boolean get() = period == 0
}

/** Port of the web `timetable/bell-generator.ts`: teaching periods with one break after period [breakAfter]. */
object BellGenerator {
    fun generate(startTime: String, periodMinutes: Int, periodsPerDay: Int, breakAfter: Int, breakMinutes: Int): List<BellRow> {
        var time = parse(startTime) ?: return emptyList()
        val rows = mutableListOf<BellRow>()
        for (period in 1..periodsPerDay) {
            val end = time.plusMinutes(periodMinutes.toLong())
            rows += BellRow(period, format(time), format(end))
            time = end
            if (period == breakAfter && breakMinutes > 0 && period < periodsPerDay) {
                val breakEnd = time.plusMinutes(breakMinutes.toLong())
                rows += BellRow(0, format(time), format(breakEnd))
                time = breakEnd
            }
        }
        return rows
    }

    fun everyDay(bell: BellPart) = generate(bell.startTime, bell.periodMinutes, bell.periodsPerDay, bell.breakAfter, bell.breakMinutes)

    /** Same start and break position, Friday's period length, count and break length. */
    fun friday(bell: BellPart) = generate(
        bell.startTime,
        bell.friday.periodMinutes,
        bell.friday.periodsPerDay,
        bell.breakAfter,
        bell.friday.breakMinutes,
    )

    private fun parse(value: String): LocalTime? = runCatching { LocalTime.parse(value) }.getOrNull()

    private fun format(time: LocalTime): String = String.format(Locale.ROOT, "%02d:%02d", time.hour, time.minute)
}
