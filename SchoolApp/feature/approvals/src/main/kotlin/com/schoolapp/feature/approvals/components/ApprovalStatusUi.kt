package com.schoolapp.feature.approvals.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.feature.approvals.R

@Composable
@ReadOnlyComposable
internal fun statusLabel(status: ApprovalStatus): String = stringResource(
    when (status) {
        ApprovalStatus.PENDING -> R.string.approvals_status_pending
        ApprovalStatus.APPROVED -> R.string.approvals_status_approved
        ApprovalStatus.REJECTED -> R.string.approvals_status_rejected
        ApprovalStatus.RETURNED -> R.string.approvals_status_returned
        ApprovalStatus.CANCELLED -> R.string.approvals_status_cancelled
        ApprovalStatus.UNKNOWN -> R.string.approvals_status_unknown
    },
)

internal fun ApprovalStatus.tone(): StatusTone = when (this) {
    ApprovalStatus.PENDING -> StatusTone.Warning
    ApprovalStatus.APPROVED -> StatusTone.Success
    ApprovalStatus.REJECTED -> StatusTone.Error
    ApprovalStatus.RETURNED -> StatusTone.Info
    ApprovalStatus.CANCELLED, ApprovalStatus.UNKNOWN -> StatusTone.Neutral
}
