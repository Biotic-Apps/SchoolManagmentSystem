package com.schoolapp.core.network.dto.dashboard

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.timetable.SectionRefDto
import com.schoolapp.core.network.dto.timetable.TeacherSlotDto
import kotlinx.serialization.Serializable

/** `GET /dashboard/teacher-today`. */
@Serializable
data class TeacherTodayDto(
    val periods: List<TeacherSlotDto> = emptyList(),
    val registers: List<RegisterStateDto> = emptyList(),
    val diariesPending: List<DiaryPendingDto> = emptyList(),
    val unreadMessages: Int = 0,
    val assignedComplaints: Int = 0,
)

@Serializable
data class RegisterStateDto(
    val sectionId: String? = null,
    val section: SectionRefDto? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val status: String? = null,
)

@Serializable
data class DiaryPendingDto(
    val sectionId: String? = null,
    val section: SectionRefDto? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val subjectId: String? = null,
    val subject: IdNameDto? = null,
    val subjectName: String? = null,
)
