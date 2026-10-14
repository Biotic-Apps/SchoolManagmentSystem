package com.schoolapp.core.network.dto.questions

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class PaperSectionDto(
    val title: String = "",
    val questionIds: List<String> = emptyList(),
    val marks: Int = 0,
)

/** A row of `GET /exam-papers` (generated papers). */
@Serializable
data class ExamPaperDto(
    val id: String,
    val schoolId: String = "",
    val subjectId: String = "",
    val classId: String = "",
    val title: String = "",
    val totalMarks: Int = 0,
    val duration: Int = 0,
    val sections: List<PaperSectionDto> = emptyList(),
    val status: String? = null,
    val createdAt: String? = null,
    val subject: IdNameDto? = null,
    val `class`: IdNameDto? = null,
)

@Serializable
data class GenerateSectionRequest(
    val title: String,
    val questionCount: Int,
    val type: String,
    val difficulty: String,
    val marksPerQuestion: Int,
)

/** `POST /exam-papers/generate`: the server picks random questions per section. */
@Serializable
data class GenerateExamPaperRequest(
    val schoolId: String,
    val subjectId: String,
    val classId: String,
    val title: String,
    val totalMarks: Int,
    val duration: Int,
    val sections: List<GenerateSectionRequest>,
)

/** `PATCH /exam-papers/:id`; null fields are left out of the body. */
@Serializable
data class UpdateExamPaperRequest(
    val title: String? = null,
    val totalMarks: Int? = null,
    val duration: Int? = null,
    val status: String? = null,
)
