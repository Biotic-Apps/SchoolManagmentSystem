package com.schoolapp.demo

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId

/** Dates relative to "now" so the demo always looks current; values use API formats (ISO / `HH:mm`). */
internal object DemoDates {
    fun today(): LocalDate = LocalDate.now()

    fun todayKey(): String = today().toString()

    /** The [count] school days (Mon-Sat) before today, newest first. */
    fun previousSchoolDays(count: Int): List<LocalDate> =
        generateSequence(today().minusDays(1)) { it.minusDays(1) }.filter(::isSchoolDay).take(count).toList()

    /** The next [count] school days after today, oldest first. */
    fun nextSchoolDays(count: Int): List<LocalDate> =
        generateSequence(today().plusDays(1)) { it.plusDays(1) }.filter(::isSchoolDay).take(count).toList()

    fun isSchoolDay(date: LocalDate): Boolean = date.dayOfWeek != DayOfWeek.SUNDAY

    /** ISO instant for a local date and `HH:mm` time. */
    fun iso(date: LocalDate, time: String): String =
        LocalDateTime.of(date, LocalTime.parse(time)).atZone(ZoneId.systemDefault()).toInstant().toString()

    fun isoNow(): String = java.time.Instant.now().toString()

    fun isoHoursFromNow(hours: Long): String = java.time.Instant.now().plusSeconds(hours * 3600).toString()

    /** Date part of an ISO instant in the device zone. */
    fun dateOf(iso: String?): String? = runCatching {
        java.time.Instant.parse(iso).atZone(ZoneId.systemDefault()).toLocalDate().toString()
    }.getOrNull() ?: iso?.take(10)

    fun inRange(date: String, from: String?, to: String?): Boolean =
        (from == null || date >= from) && (to == null || date <= to)
}
