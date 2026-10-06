package com.schoolapp.feature.activities.domain

import com.schoolapp.core.common.time.TimeFormat
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

/** Parsing and 12-hour display of activity times, which arrive as ISO instants, local date-times or dates. */
object ActivityTimes {

    /** ISO instant / offset date-time / local date-time / date -> device-local date-time; null when unparseable. */
    fun toLocal(raw: String?, zone: ZoneId = ZoneId.systemDefault()): LocalDateTime? {
        val value = raw?.trim()?.takeIf { it.isNotEmpty() } ?: return null
        return parseOrNull { Instant.parse(value).atZone(zone).toLocalDateTime() }
            ?: parseOrNull { OffsetDateTime.parse(value).atZoneSameInstant(zone).toLocalDateTime() }
            ?: parseOrNull { LocalDateTime.parse(value) }
            ?: parseOrNull { LocalDate.parse(value).atStartOfDay() }
    }

    /** True when the activity (its end, or start when there is no end) is still ahead of [now]. */
    fun isUpcoming(startAt: String, endAt: String?, now: LocalDateTime, zone: ZoneId = ZoneId.systemDefault()): Boolean {
        val reference = toLocal(endAt, zone) ?: toLocal(startAt, zone) ?: return true
        return !reference.isBefore(now)
    }

    /** "5 Oct 2026, 9:00 AM – 12:00 PM", or both full date-times when the activity spans days. */
    fun formatRange(startAt: String, endAt: String?, zone: ZoneId = ZoneId.systemDefault()): String {
        val start = toLocal(startAt, zone) ?: return startAt
        val startText = format(start)
        val end = toLocal(endAt, zone) ?: return startText
        val endText = if (end.toLocalDate() == start.toLocalDate()) TimeFormat.formatTime12(end.toLocalTime()) else format(end)
        return "$startText – $endText"
    }

    fun format(dateTime: LocalDateTime): String =
        "${TimeFormat.formatDate(dateTime.toLocalDate())}, ${TimeFormat.formatTime12(dateTime.toLocalTime())}"

    private inline fun <T> parseOrNull(block: () -> T): T? = try {
        block()
    } catch (e: DateTimeParseException) {
        null
    }
}
