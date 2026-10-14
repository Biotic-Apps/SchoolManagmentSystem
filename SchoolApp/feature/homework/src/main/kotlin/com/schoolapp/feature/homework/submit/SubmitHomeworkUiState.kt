package com.schoolapp.feature.homework.submit

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkSubmission

@Immutable
data class SubmitHomeworkUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val homework: Homework? = null,
    val submission: HomeworkSubmission? = null,
    val hasSubmitPermission: Boolean = false,
    val text: String = "",
    val attachments: AttachmentDraft = AttachmentDraft(),
    val emptyError: Boolean = false,
    val textTooLong: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
    val uploadError: AppError? = null,
    val done: Boolean = false,
) {
    /** Same rule as the web: nothing yet, or SUBMITTED / LATE / RETURNED (not GRADED). */
    val canSubmit: Boolean get() = hasSubmitPermission && (submission == null || submission.canResubmit)
}
