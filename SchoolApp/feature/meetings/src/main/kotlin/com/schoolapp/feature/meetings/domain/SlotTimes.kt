package com.schoolapp.feature.meetings.domain

import java.time.DayOfWeek
import java.time.LocalDate
import java.util.Locale

/** `HH:mm` helpers for slot drafts; the API compares times as strings, so they stay zero-padded. */
internal object SlotTimes {
    const val DEFAULT_START = "13:00"
    const val DEFAULT_END = "13:15"
    const val MIN_LENGTH_MINUTES = 15
    private const val LATEST_MINUTES = 23 * 60 + 55

    fun minutes(value: String): Int {
        val parts = value.split(':')
        return (parts.getOrNull(0)?.toIntOrNull() ?: 0) * 60 + (parts.getOrNull(1)?.toIntOrNull() ?: 0)
    }

    /** Minutes since midnight as `HH:mm`, capped at 23:55 so a copied row never wraps past midnight. */
    fun time(totalMinutes: Int): String {
        val capped = totalMinutes.coerceIn(0, LATEST_MINUTES)
        return "%02d:%02d".format(Locale.ENGLISH, capped / 60, capped % 60)
    }

    /** Monday of [date]'s week, matching the web "My slots" pager. */
    fun weekStart(date: LocalDate): LocalDate = date.minusDays((date.dayOfWeek.value - DayOfWeek.MONDAY.value).toLong())
}
