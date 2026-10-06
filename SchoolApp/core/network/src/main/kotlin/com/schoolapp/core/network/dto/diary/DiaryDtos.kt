package com.schoolapp.core.network.dto.diary

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class DiaryEntryDto(
    val id: String,
    val sectionId: String = "",
    val className: String? = null,
    val sectionName: String? = null,
    val subject: IdNameDto? = null,
    val subjectId: String? = null,
    val date: String = "",
    val topics: String? = null,
    val homework: String? = null,
    val dueDate: String? = null,
    val attachments: List<AttachmentDto> = emptyList(),
    val status: String? = null,
    val revision: Int = 0,
    val author: IdNameDto? = null,
    val onBehalfOf: IdNameDto? = null,
    val comment: String? = null,
    val publishedAt: String? = null,
    val approvalId: String? = null,
)

/** `PUT /diary` upsert body; also the outbox payload. */
@Serializable
data class DiaryBodyDto(
    val sectionId: String,
    val subjectId: String,
    val date: String,
    val topics: String,
    val homework: String? = null,
    val dueDate: String? = null,
    val attachmentFileIds: List<String>? = null,
    val clientRequestId: String? = null,
)

/** One row of `GET /diary/missing`. */
@Serializable
data class MissingDiaryDto(
    val sectionId: String,
    val className: String? = null,
    val sectionName: String? = null,
    val subject: IdNameDto? = null,
    val subjectId: String? = null,
    val subjectName: String? = null,
)
