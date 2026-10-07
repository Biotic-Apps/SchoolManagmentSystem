package com.schoolapp.feature.complaints.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.files.AttachmentDraft

enum class ReasonAction { ESCALATE, CLOSE, REOPEN }

/** Files per update; same cap as the web update dialog. */
internal const val UPDATE_MAX_ATTACHMENTS = 3

/** "Add update" (assignee, may change status) or "Add comment" (complainant). */
@Immutable
data class UpdateEditor(
    val allowStatus: Boolean,
    val message: String = "",
    val status: ComplaintStatus? = null,
    val attachments: AttachmentDraft = AttachmentDraft(),
    val messageMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

/** Escalate (reason required), close or reopen (reason optional). */
@Immutable
data class ReasonEditor(
    val action: ReasonAction,
    val reason: String = "",
    val reasonMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val reasonRequired: Boolean get() = action == ReasonAction.ESCALATE
}

@Immutable
data class ComplaintDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val detail: ComplaintDetailUi? = null,
    val updateEditor: UpdateEditor? = null,
    val reasonEditor: ReasonEditor? = null,
    val assignEditor: AssignEditor? = null,
)
