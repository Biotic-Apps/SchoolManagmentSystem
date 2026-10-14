package com.schoolapp.core.network.dto.questions

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

/** A row of `GET /questions` (question bank). */
@Serializable
data class QuestionDto(
    val id: String,
    val schoolId: String = "",
    val subjectId: String = "",
    val classId: String = "",
    val chapterName: String = "",
    val questionType: String = "",
    val difficultyLevel: String = "",
    val marks: Int = 0,
    val questionText: String = "",
    val options: List<String>? = null,
    val correctAnswer: String = "",
    val status: String? = null,
    val createdAt: String? = null,
    val subject: IdNameDto? = null,
    val `class`: IdNameDto? = null,
)

/** `POST /questions`; [options] only for MCQ. */
@Serializable
data class CreateQuestionRequest(
    val schoolId: String,
    val subjectId: String,
    val classId: String,
    val chapterName: String,
    val questionType: String,
    val difficultyLevel: String,
    val marks: Int,
    val questionText: String,
    val options: List<String>? = null,
    val correctAnswer: String,
)

/** `PATCH /questions/:id`: subject, class and school cannot change (the API rejects them). */
@Serializable
data class UpdateQuestionRequest(
    val chapterName: String,
    val questionType: String,
    val difficultyLevel: String,
    val marks: Int,
    val questionText: String,
    val options: List<String>,
    val correctAnswer: String,
)
