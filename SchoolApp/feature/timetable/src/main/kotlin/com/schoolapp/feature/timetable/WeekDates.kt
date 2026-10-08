package com.schoolapp.feature.timetable

import java.time.DayOfWeek
import java.time.LocalDate

/**
 * The week the screen shows: the current Monday–Sunday, except on Sunday when the coming week is shown
 * (school is closed, so Monday is what matters).
 */
internal data class WeekDates(val monday: LocalDate) {
    fun dateFor(day: Int): LocalDate = monday.plusDays((day - 1).toLong())

    /** ISO weekday of [today] when it falls in this week, else null. */
    fun dayOf(today: LocalDate): Int? = today.dayOfWeek.value.takeIf { dateFor(it) == today }

    val sunday: LocalDate get() = monday.plusDays(6)

    companion object {
        fun forToday(today: LocalDate): WeekDates {
            val start = if (today.dayOfWeek == DayOfWeek.SUNDAY) today.plusDays(1) else today.minusDays((today.dayOfWeek.value - 1).toLong())
            return WeekDates(start)
        }
    }
}
