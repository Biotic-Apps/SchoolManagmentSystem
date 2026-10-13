package com.schoolapp.feature.messages.components

import com.schoolapp.core.common.time.TimeFormat
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

/** ISO UTC timestamps of messages in the device zone; always 12-hour. */
internal object MessageTime {
    fun local(iso: String?, zone: ZoneId = ZoneId.systemDefault()): LocalDateTime? {
        if (iso.isNullOrBlank()) return null
        return try {
            Instant.parse(iso).atZone(zone).toLocalDateTime()
        } catch (e: DateTimeParseException) {
            null
        }
    }

    /** "3:05 PM". */
    fun time(iso: String?): String? = local(iso)?.let { TimeFormat.formatTime12(it.toLocalTime()) }

    /** "Oct 13, 2026 3:05 PM" — full date and time for long-press tooltip. */
    fun fullTimestamp(iso: String?): String? {
        val ldt = local(iso) ?: return null
        return "${TimeFormat.formatDate(ldt.toLocalDate())} ${TimeFormat.formatTime12(ldt.toLocalTime())}"
    }

    /** Thread list label: time for today, otherwise the date. */
    fun listLabel(iso: String?, today: LocalDate): String? {
        val dateTime = local(iso) ?: return null
        return if (dateTime.toLocalDate() == today) {
            TimeFormat.formatTime12(dateTime.toLocalTime())
        } else {
            TimeFormat.formatDate(dateTime.toLocalDate())
        }
    }
}
