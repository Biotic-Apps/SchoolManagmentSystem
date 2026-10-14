package com.schoolapp.feature.homework.submissions

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.homework.HomeworkChange
import com.schoolapp.core.model.homework.HomeworkSubmission

/** Grade form for one submission (web GradeDialog). */
@Immutable
data class GradeDraft(
    val submission: HomeworkSubmission,
    val marks: String = submission.marks?.toString().orEmpty(),
    val grade: String = submission.grade.orEmpty(),
    val feedback: String = submission.feedback.orEmpty(),
    val marksInvalid: Boolean = false,
    val gradeTooLong: Boolean = false,
    val feedbackTooLong: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

/** Return-for-revision note for one submission. */
@Immutable
data class ReturnDraft(
    val submission: HomeworkSubmission,
    val note: String,
    val noteMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class SubmissionsUiState(
    val title: String = "",
    val subjectName: String = "",
    val dueDate: String = "",
    val maxMarks: Int? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val submissions: List<HomeworkSubmission> = emptyList(),
    val canReview: Boolean = false,
    val grading: GradeDraft? = null,
    val returning: ReturnDraft? = null,
    val change: HomeworkChange? = null,
)
