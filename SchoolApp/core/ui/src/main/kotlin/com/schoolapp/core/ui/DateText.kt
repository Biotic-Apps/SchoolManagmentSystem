package com.schoolapp.core.ui

import com.schoolapp.core.common.time.TimeFormat
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeParseException

/** `YYYY-MM-DD` (or the date part of an ISO timestamp) as "5 Oct 2026"; falls back to the raw text. */
fun formatDate(raw: String?): String? {
    if (raw.isNullOrBlank()) return null
    return try {
        TimeFormat.formatDate(LocalDate.parse(raw.take(DATE_LENGTH)))
    } catch (e: DateTimeParseException) {
        raw
    }
}

/** ISO UTC timestamp in the device time zone, always 12-hour: "5 Oct 2026, 12:10 PM". */
fun formatTimestamp(raw: String?): String? {
    if (raw.isNullOrBlank()) return null
    return try {
        TimeFormat.formatDateTime12(Instant.parse(raw))
    } catch (e: DateTimeParseException) {
        formatDate(raw)
    }
}

/** API `HH:mm` as "8:00 AM"; null stays null. */
fun formatTime(raw: String?): String? = raw?.let(TimeFormat::formatTime12)

fun formatDateRange(start: String?, end: String?): String? =
    listOfNotNull(formatDate(start), formatDate(end)).distinct().takeIf { it.isNotEmpty() }?.joinToString(" – ")

private const val DATE_LENGTH = 10
