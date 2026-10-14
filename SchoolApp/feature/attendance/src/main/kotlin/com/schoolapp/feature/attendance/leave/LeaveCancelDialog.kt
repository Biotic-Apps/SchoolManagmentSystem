package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.feature.attendance.R

/** Confirms withdrawing a still-pending request. */
@Composable
internal fun LeaveCancelDialog(leave: LeaveRequest, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    ConfirmDialog(
        title = stringResource(R.string.leave_cancel_title),
        message = stringResource(R.string.leave_cancel_message, formatDateRange(leave.from, leave.to).orEmpty()),
        confirmLabel = stringResource(R.string.leave_cancel_confirm),
        dismissLabel = stringResource(R.string.leave_cancel_keep),
        onConfirm = onConfirm,
        onDismiss = onDismiss,
        destructive = true,
    )
}
