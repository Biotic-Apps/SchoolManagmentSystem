package com.schoolapp.feature.attendance.review

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveStatus

enum class ReviewTab { PENDING, DECIDED }

enum class ReviewMessage { APPROVED, REJECTED }

/** Open decision sheet for one SUBMITTED request. */
@Immutable
data class LeaveDecision(
    val leave: LeaveRequest,
    val comment: String = "",
    /** Set when opened from a card's Approve/Reject button: the sheet then confirms only that action. */
    val intent: ApprovalAction? = null,
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
    /** Status filter on the Decided tab; null = every decided request. */
    val decidedFilter: LeaveStatus? = null,
) {
    val items: List<LeaveRequest>
        get() = if (tab == ReviewTab.PENDING) pending else decided.filter { decidedFilter == null || it.status == decidedFilter }

    val approvedCount: Int get() = decided.count { it.status == LeaveStatus.APPROVED }

    val rejectedCount: Int get() = decided.count { it.status == LeaveStatus.REJECTED }
}
