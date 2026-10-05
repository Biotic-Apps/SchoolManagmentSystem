package com.schoolapp.core.common.time

import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * Display formatting shared by every screen: times are always 12-hour with AM/PM ("8:00 AM"),
 * regardless of the device's 24-hour setting. API values stay 24-hour `HH:mm`, `YYYY-MM-DD` and ISO UTC.
 */
object TimeFormat {
    private val Time12: DateTimeFormatter = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH)
    private val Date: DateTimeFormatter = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)
    private val DateTime12: DateTimeFormatter = DateTimeFormatter.ofPattern("d MMM yyyy, h:mm a", Locale.ENGLISH)
    private val Time24hPattern = Regex("^\\d{1,2}:\\d{2}(:\\d{2})?$")

    /** `"13:05"` -> `"1:05 PM"`; anything unparseable is returned unchanged. */
    fun formatTime12(hhmm: String): String = parseTime(hhmm)?.format(Time12) ?: hhmm

    fun formatTime12(time: LocalTime): String = time.format(Time12)

    fun formatDateTime12(instant: Instant, zone: ZoneId = ZoneId.systemDefault()): String =
        instant.atZone(zone).format(DateTime12)

    fun formatDate(date: LocalDate): String = date.format(Date)

    /** True for API time-of-day strings such as `11:00` or `08:00:00`. */
    fun isTime24h(value: String): Boolean = Time24hPattern.matches(value.trim())

    /** Parses an API `HH:mm` (or `HH:mm:ss`) value; null when it is not a valid time. */
    fun parseTime(hhmm: String): LocalTime? {
        val value = hhmm.trim()
        if (!isTime24h(value)) return null
        val (hour, minute) = value.split(':').map(String::toInt)
        return if (hour in 0..23 && minute in 0..59) LocalTime.of(hour, minute) else null
    }

    /** Formats back to the API's 24-hour `HH:mm`. */
    fun toApiTime(time: LocalTime): String = "%02d:%02d".format(Locale.ENGLISH, time.hour, time.minute)
}
