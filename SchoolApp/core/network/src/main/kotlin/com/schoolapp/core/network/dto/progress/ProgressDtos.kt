package com.schoolapp.core.network.dto.progress

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ProgressNoteDto(
    val id: String,
    val studentId: String? = null,
    val category: String? = null,
    val note: String = "",
    val visibleToParent: Boolean = false,
    val author: IdNameDto? = null,
    val createdBy: IdNameDto? = null,
    val createdAt: String? = null,
)

@Serializable
data class ProgressNoteBodyDto(val category: String, val note: String, val visibleToParent: Boolean)

@Serializable
data class HomeworkStatusBodyDto(val entries: List<HomeworkEntryDto>)

@Serializable
data class HomeworkEntryDto(val studentId: String, val status: String)

/** One published diary homework of a student's section plus the teacher's tick (`status` null = not checked yet). */
@Serializable
data class HomeworkItemDto(
    val diaryEntryId: String? = null,
    val id: String? = null,
    val date: String,
    val dueDate: String? = null,
    val subject: IdNameDto? = null,
    val subjectName: String? = null,
    val homework: String? = null,
    val status: String? = null,
)
