package com.schoolapp.feature.approvals

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus

@Immutable
data class ApprovalsUiState(
    val filter: ApprovalStatus = ApprovalStatus.PENDING,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val items: List<ApprovalRequest> = emptyList(),
    val error: AppError? = null,
) {
    companion object {
        val Filters = listOf(ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED, ApprovalStatus.RETURNED)
    }
}
