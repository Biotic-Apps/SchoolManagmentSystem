package com.schoolapp.feature.attendance.review

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.model.leave.LeaveRequest

enum class ReviewTab { PENDING, DECIDED }

enum class ReviewMessage { APPROVED, REJECTED }

/** Open decision sheet for one SUBMITTED request. */
@Immutable
data class LeaveDecision(
    val leave: LeaveRequest,
    val comment: String = "",
    val busyAction: ApprovalAction? = null,
    val error: AppError? = null,
)

@Immutable
data class LeaveReviewUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val tab: ReviewTab = ReviewTab.PENDING,
    val pending: List<LeaveRequest> = emptyList(),
    val decided: List<LeaveRequest> = emptyList(),
    val decision: LeaveDecision? = null,
    val message: ReviewMessage? = null,
) {
    val items: List<LeaveRequest> get() = if (tab == ReviewTab.PENDING) pending else decided
}
