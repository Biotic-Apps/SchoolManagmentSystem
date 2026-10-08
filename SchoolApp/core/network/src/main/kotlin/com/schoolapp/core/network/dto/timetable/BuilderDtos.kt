package com.schoolapp.core.network.dto.timetable

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** `GET /timetables/:sectionId/builder`. */
@Serializable
data class TimetableBuilderDto(
    val timetable: DraftTimetableDto,
    val section: BuilderSectionDto,
    val lessons: List<BuilderLessonDto> = emptyList(),
    val rooms: List<IdNameDto> = emptyList(),
    val busy: List<BusyEntryDto> = emptyList(),
    val conflicts: List<ConflictDto> = emptyList(),
)

/** Draft view of `GET /timetables` (editor fields included). */
@Serializable
data class DraftTimetableDto(
    val sectionId: String,
    val sessionId: String? = null,
    val state: String? = null,
    val status: String? = null,
    val version: Int = 0,
    val publishedAt: String? = null,
    val canEdit: Boolean = false,
    val canPublish: Boolean = false,
    val publishBlockedReason: String? = null,
    val slots: List<SlotDto> = emptyList(),
    val periods: List<PeriodDto> = emptyList(),
    val dayPeriods: Map<String, List<PeriodDto>> = emptyMap(),
    val workingDays: List<Int> = emptyList(),
)

@Serializable
data class BuilderSectionDto(
    val id: String,
    val name: String,
    val group: String? = null,
    @SerialName("class") val schoolClass: IdNameDto? = null,
    val branchId: String,
)

@Serializable
data class BuilderLessonDto(
    val subject: IdNameDto,
    val periodsPerWeek: Int? = null,
    val placed: Int = 0,
    val teacher: IdNameDto? = null,
)

@Serializable
data class BusyEntryDto(
    val staffId: String? = null,
    val roomId: String? = null,
    val day: Int,
    val periodIndex: Int,
    val sectionName: String? = null,
    val published: Boolean = false,
)

@Serializable
data class ConflictDto(
    val type: String,
    val severity: String? = null,
    val day: Int = 0,
    val periodIndex: Int = 0,
    val message: String = "",
)

/** Body of `PUT /timetables/:sectionId/slots/:day/:periodIndex`. */
@Serializable
data class LessonRequest(val subjectId: String, val staffId: String, val roomId: String? = null, val allocate: Boolean)

/** Response of the per-cell PUT/DELETE. */
@Serializable
data class CellResultDto(
    val slot: SlotDto? = null,
    val conflicts: List<ConflictDto> = emptyList(),
    val lesson: LessonCountDto? = null,
    val state: String? = null,
    val canPublish: Boolean = false,
    val publishBlockedReason: String? = null,
    val allocated: Boolean = false,
)

@Serializable
data class LessonCountDto(val subjectId: String, val placed: Int = 0, val periodsPerWeek: Int? = null)

/** `PUT /branches/:id/bell-schedule` body. */
@Serializable
data class BellScheduleRequest(
    val default: List<PeriodRequest>,
    val days: Map<String, List<PeriodRequest>>,
    val dropLessons: Boolean? = null,
)

@Serializable
data class PeriodRequest(val index: Int, val startTime: String, val endTime: String, val isBreak: Boolean, val label: String? = null)
