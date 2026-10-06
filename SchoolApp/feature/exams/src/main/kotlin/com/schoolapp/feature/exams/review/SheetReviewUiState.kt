package com.schoolapp.feature.exams.review

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus

enum class ReviewKind { ACCEPT, RETURN }

/** The Accept / Return sheet; a return needs a comment for the teacher. */
@Immutable
data class ReviewDecision(
    val kind: ReviewKind,
    val comment: String = "",
    val commentMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class SheetReviewUiState(
    val title: String = "",
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val sheet: MarkSheet? = null,
    val canApprove: Boolean = false,
    val decision: ReviewDecision? = null,
    /** Set after a decision was saved. */
    val decided: ReviewKind? = null,
) {
    val canDecide: Boolean get() = canApprove && sheet?.status == MarkSheetStatus.SUBMITTED
}
