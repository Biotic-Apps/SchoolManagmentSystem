package com.schoolapp.feature.health.report

import com.schoolapp.core.common.time.TimeFormat
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

/** Fields that block submitting the report; the incident time may not be after [now]. */
internal fun validateIncident(state: ReportIncidentUiState, now: LocalDateTime): Set<IncidentField> = buildSet {
    if (state.studentId == null) add(IncidentField.STUDENT)
    if (state.description.isBlank()) add(IncidentField.DESCRIPTION)
    if (state.actionTaken.isBlank()) add(IncidentField.ACTION_TAKEN)
    val occurred = localDateTime(state.date, state.time)
    if (occurred == null || occurred.isAfter(now)) add(IncidentField.FUTURE_TIME)
}

internal fun localDateTime(date: String, time: String): LocalDateTime? {
    val day = try {
        LocalDate.parse(date)
    } catch (e: DateTimeParseException) {
        return null
    }
    val clock = TimeFormat.parseTime(time) ?: return null
    return LocalDateTime.of(day, clock)
}

/** Device-local date + time as the API's ISO UTC instant, e.g. `2026-10-06T05:30:00Z`. */
internal fun toUtcInstant(dateTime: LocalDateTime, zone: ZoneId = ZoneId.systemDefault()): String =
    dateTime.atZone(zone).toInstant().toString()
