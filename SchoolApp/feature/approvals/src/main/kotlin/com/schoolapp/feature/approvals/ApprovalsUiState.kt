package com.schoolapp.feature.approvals

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus

@Immutable
data class ApprovalsUiState(
    val filter: ApprovalStatus = ApprovalStatus.PENDING,
    /** Request type key (e.g. `LEAVE`); null = all types. */
    val type: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val items: List<ApprovalRequest> = emptyList(),
    val page: Int = 1,
    val hasMore: Boolean = false,
    val error: AppError? = null,
    val moreError: AppError? = null,
) {
    companion object {
        val Filters = listOf(
            ApprovalStatus.PENDING,
            ApprovalStatus.APPROVED,
            ApprovalStatus.REJECTED,
            ApprovalStatus.RETURNED,
            ApprovalStatus.CANCELLED,
        )

        /** Same list as the web approvals type filter (docs/architecture.md section 7). */
        val Types = listOf(
            "HELPER_DRAFT", "PROBATION_REVIEW", "ATTENDANCE_CORRECTION", "LEAVE", "TIMETABLE_PUBLISH", "ACTIVITY",
            "DIARY_MODERATION", "RESULT_PUBLISH", "PROMOTION", "CONCESSION", "REFUND", "PAYMENT_REVERSAL", "PAYROLL",
            "EXPENSE", "PURCHASE_ORDER", "ADMISSION", "CHILD_LINK", "CONTACT_CHANGE", "EARLY_LEAVE", "CERTIFICATE",
        )
    }
}
