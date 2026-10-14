package com.schoolapp.core.network.dto.exams.admin

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ExamPaperDto(
    val id: String? = null,
    val classId: String = "",
    val className: String? = null,
    val subject: IdNameDto? = null,
    val subjectId: String? = null,
    val subjectName: String? = null,
    val date: String = "",
    val startTime: String = "",
    val endTime: String = "",
    val maxMarks: Double = 0.0,
    val passMarks: Double = 0.0,
    val roomId: String? = null,
)

/** `GET /exams/:id` (also returned by create, update, schedule, status, approve-results and publish). */
@Serializable
data class ExamDetailDto(
    val id: String,
    val branchId: String? = null,
    val sessionId: String? = null,
    val termId: String? = null,
    val name: String = "",
    val type: String? = null,
    val status: String? = null,
    val gradingScheme: IdNameDto? = null,
    val gradingSchemeId: String? = null,
    val weightPercent: Int? = null,
    val classIds: List<String> = emptyList(),
    val classes: List<IdNameDto> = emptyList(),
    val approvalId: String? = null,
    val computedAt: String? = null,
    val publishedAt: String? = null,
    val papers: List<ExamPaperDto> = emptyList(),
)

@Serializable
data class ExamCreateBodyDto(
    val branchId: String,
    val sessionId: String,
    val termId: String? = null,
    val name: String,
    val type: String,
    val gradingSchemeId: String,
    val weightPercent: Int? = null,
    val classIds: List<String>,
)

/** PATCH body: branch and session never change. */
@Serializable
data class ExamUpdateBodyDto(
    val termId: String? = null,
    val name: String,
    val type: String,
    val gradingSchemeId: String,
    val weightPercent: Int? = null,
    val classIds: List<String>,
)

@Serializable
data class SchedulePaperBodyDto(
    val classId: String,
    val subjectId: String,
    val date: String,
    val startTime: String,
    val endTime: String,
    val maxMarks: Int,
    val passMarks: Int,
    val roomId: String? = null,
)

@Serializable
data class ScheduleBodyDto(val papers: List<SchedulePaperBodyDto>)

@Serializable
data class ExamStatusBodyDto(val status: String)

@Serializable
data class JobIdDto(val jobId: String? = null)

/** `POST /exams/:id/print`: kind REPORT_CARDS, DATE_SHEET or AWARD_LIST. */
@Serializable
data class ExamPrintBodyDto(
    val kind: String,
    val sectionId: String? = null,
    val classId: String? = null,
    val subjectId: String? = null,
    val templateId: String? = null,
)
