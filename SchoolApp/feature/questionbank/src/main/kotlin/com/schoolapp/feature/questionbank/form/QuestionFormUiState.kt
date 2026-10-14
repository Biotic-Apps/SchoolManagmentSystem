package com.schoolapp.feature.questionbank.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.common.Catalog

enum class QuestionField { SUBJECT, CLASS, CHAPTER, TYPE, DIFFICULTY, MARKS, TEXT, OPTIONS, ANSWER }

@Immutable
data class QuestionFormUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val isEdit: Boolean = false,
    val catalog: Catalog = Catalog(),
    val subjectId: String? = null,
    val classId: String? = null,
    /** Shown while editing when the subject / class is no longer in the school catalog. */
    val subjectName: String? = null,
    val className: String? = null,
    val chapter: String = "",
    val type: QuestionType? = null,
    val difficulty: Difficulty? = null,
    val marks: String = "",
    val text: String = "",
    val options: List<String> = List(DEFAULT_OPTIONS) { "" },
    /** MCQ: index of the right choice in [options]. */
    val correctIndex: Int? = null,
    /** Every other type: the answer text ("True" / "False" for true-false). */
    val answer: String = "",
    /** Our own checks: field to string resource. */
    val errors: Map<QuestionField, Int> = emptyMap(),
    /** Server VALIDATION_FAILED lines per field. */
    val serverErrors: Map<QuestionField, String> = emptyMap(),
    val saveError: AppError? = null,
    val isSaving: Boolean = false,
    val saved: Boolean = false,
) {
    val canAddOption: Boolean get() = options.size < MAX_OPTIONS
    val canRemoveOption: Boolean get() = options.size > MIN_OPTIONS

    companion object {
        const val DEFAULT_OPTIONS = 4
        const val MIN_OPTIONS = 2
        const val MAX_OPTIONS = 8
    }
}
