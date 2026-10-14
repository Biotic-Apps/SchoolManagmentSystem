package com.schoolapp.core.network.homework

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class HomeworkDto(
    val id: String,
    val classId: String? = null,
    val sectionId: String = "",
    val className: String? = null,
    val sectionName: String? = null,
    val subject: IdNameDto? = null,
    val title: String = "",
    val description: String = "",
    val dueDate: String = "",
    val maxMarks: Int? = null,
    val attachments: List<AttachmentDto> = emptyList(),
    val assignedBy: IdNameDto? = null,
    val status: String? = null,
    val submissionCount: Int = 0,
    val gradedCount: Int = 0,
    val createdAt: String? = null,
)

@Serializable
data class HomeworkSubmissionDto(
    val id: String,
    val homeworkId: String = "",
    val student: IdNameDto? = null,
    val submittedAt: String? = null,
    val text: String? = null,
    val attachments: List<AttachmentDto> = emptyList(),
    val marks: Int? = null,
    val grade: String? = null,
    val feedback: String? = null,
    val gradedBy: IdNameDto? = null,
    val gradedAt: String? = null,
    val status: String? = null,
)

/** `POST /homework`. */
@Serializable
data class CreateHomeworkBody(
    val sectionId: String,
    val subjectId: String,
    val title: String,
    val description: String,
    val dueDate: String,
    val maxMarks: Int? = null,
    val attachmentFileIds: List<String>? = null,
)

/** `POST /homework/:id/submit/:studentId`. */
@Serializable
data class SubmitHomeworkBody(val text: String? = null, val fileIds: List<String>? = null)

/** `POST /homework/submissions/:id/grade`. */
@Serializable
data class GradeSubmissionBody(val marks: Int? = null, val grade: String? = null, val feedback: String? = null)

/** `POST /homework/submissions/:id/return`. */
@Serializable
data class ReturnSubmissionBody(val feedback: String)

/** `GET /classes/:id/subjects` row (only what the assign form needs). */
@Serializable
data class HomeworkSubjectDto(val id: String, val code: String? = null, val name: String = "")
