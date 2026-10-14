package com.schoolapp.feature.settings.backups

import java.text.NumberFormat
import java.time.Duration
import java.time.Instant
import java.time.format.DateTimeParseException
import java.util.Locale

/** "2m 14s" between two ISO times; null while unfinished. */
internal fun formatDuration(startIso: String?, endIso: String?): String? {
    if (startIso.isNullOrBlank() || endIso.isNullOrBlank()) return null
    val seconds = try {
        Duration.between(Instant.parse(startIso), Instant.parse(endIso)).seconds.coerceAtLeast(0)
    } catch (e: DateTimeParseException) {
        return null
    }
    val hours = seconds / SECONDS_PER_HOUR
    val minutes = (seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE
    val rest = seconds % SECONDS_PER_MINUTE
    return when {
        hours > 0 -> "${hours}h ${minutes}m"
        minutes > 0 -> "${minutes}m ${rest}s"
        else -> "${rest}s"
    }
}

/** 1536 -> "1.5 KB"; null stays null. */
internal fun formatBytes(bytes: Long?): String? {
    if (bytes == null || bytes < 0) return null
    var value = bytes.toDouble()
    var unit = 0
    while (value >= STEP && unit < UNITS.lastIndex) {
        value /= STEP
        unit++
    }
    val text = if (unit == 0) value.toLong().toString() else String.format(Locale.ENGLISH, "%.1f", value)
    return "$text ${UNITS[unit]}"
}

/** Numeric check values with grouping ("12,480"); text as sent. */
internal fun formatCheckValue(value: String?, numeric: Boolean): String? {
    if (value == null) return null
    if (!numeric) return value
    val number = value.toDoubleOrNull() ?: return value
    return NumberFormat.getNumberInstance(Locale.ENGLISH).format(number)
}

private const val SECONDS_PER_HOUR = 3600L
private const val SECONDS_PER_MINUTE = 60L
private const val STEP = 1024.0
private val UNITS = listOf("B", "KB", "MB", "GB", "TB")
