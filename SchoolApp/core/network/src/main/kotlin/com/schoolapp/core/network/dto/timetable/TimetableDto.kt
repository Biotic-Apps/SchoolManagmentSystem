package com.schoolapp.core.network.dto.timetable

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/** `GET /timetables?sectionId=`; [state] and [dayPeriods] are missing on older servers. */
@Serializable
data class TimetableDto(
    val sectionId: String,
    val sessionId: String? = null,
    val state: String? = null,
    val status: String? = null,
    val version: Int? = null,
    val publishedAt: String? = null,
    val slots: List<SlotDto> = emptyList(),
    val periods: List<PeriodDto> = emptyList(),
    /** Weekday-specific schedules keyed by ISO day ("5" = Friday). */
    val dayPeriods: Map<String, List<PeriodDto>> = emptyMap(),
    val canEdit: Boolean = false,
)

@Serializable
data class SlotDto(
    val day: Int,
    val periodIndex: Int,
    val subject: IdNameDto? = null,
    val staff: IdNameDto? = null,
    val room: IdNameDto? = null,
)

@Serializable
data class PeriodDto(
    val index: Int,
    val startTime: String,
    val endTime: String,
    val isBreak: Boolean = false,
    val label: String? = null,
    val number: Int? = null,
)

/** `GET /branches/:id/bell-schedule`. */
@Serializable
data class BellScheduleDto(
    val workingDays: List<Int> = emptyList(),
    val default: List<PeriodDto> = emptyList(),
    val days: Map<String, List<PeriodDto>> = emptyMap(),
)
