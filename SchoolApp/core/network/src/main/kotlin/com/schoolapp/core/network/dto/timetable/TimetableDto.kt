package com.schoolapp.core.network.dto.timetable

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class TimetableDto(
    val sectionId: String,
    val sessionId: String? = null,
    val status: String? = null,
    val version: Int? = null,
    val publishedAt: String? = null,
    val slots: List<SlotDto> = emptyList(),
    val periods: List<PeriodDto> = emptyList(),
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
)
