package com.schoolapp.feature.approvals.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest

@Immutable
data class ApprovalDetailUiState(
    val isLoading: Boolean = true,
    val request: ApprovalRequest? = null,
    val loadError: AppError? = null,
    val canDecide: Boolean = false,
    val comment: String = "",
    val commentRequired: Boolean = false,
    val busyDecision: ApprovalDecision? = null,
    val decideError: AppError? = null,
    val decided: ApprovalDecision? = null,
) {
    val showActions: Boolean get() = canDecide && decided == null
}
