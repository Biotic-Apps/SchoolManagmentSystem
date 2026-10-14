package com.schoolapp.feature.homework.assign

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.organisation.Subject

enum class AssignField { SUBJECT, TITLE, TITLE_LENGTH, DESCRIPTION, DESCRIPTION_LENGTH, DUE_DATE, MAX_MARKS }

@Immutable
data class AssignHomeworkUiState(
    val sectionLabel: String = "",
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val subjects: List<Subject> = emptyList(),
    val subjectId: String? = null,
    val title: String = "",
    val description: String = "",
    val dueDate: String? = null,
    val maxMarks: String = "",
    val attachments: AttachmentDraft = AttachmentDraft(),
    val errors: Set<AssignField> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
    val uploadError: AppError? = null,
    val done: Boolean = false,
)
