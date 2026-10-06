package com.schoolapp.feature.attendance.review

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.leaveTypeLabel

@Composable
internal fun LeaveDecisionSheet(
    decision: LeaveDecision,
    onCommentChange: (String) -> Unit,
    onApprove: () -> Unit,
    onReject: () -> Unit,
    onDismiss: () -> Unit,
) {
    val leave = decision.leave
    val busy = decision.busyAction != null
    AppBottomSheet(title = leave.subject.name, onDismiss = onDismiss) {
        decision.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        KeyValueRow(
            stringResource(R.string.attendance_leave_kind),
            stringResource(if (leave.kind == LeaveKind.STAFF) R.string.attendance_leave_kind_staff else R.string.attendance_leave_kind_student),
        )
        KeyValueRow(stringResource(R.string.attendance_leave_dates), formatDateRange(leave.from, leave.to))
        KeyValueRow(stringResource(R.string.attendance_leave_days), pluralStringResource(R.plurals.attendance_days, leave.days, leave.days))
        leave.type?.let { KeyValueRow(stringResource(R.string.attendance_leave_type), leaveTypeLabel(it)) }
        KeyValueRow(stringResource(R.string.attendance_leave_reason), leave.reason)
        leave.requestedBy?.let { KeyValueRow(stringResource(R.string.attendance_leave_requested_by), it.name) }
        formatTimestamp(leave.createdAt)?.let { KeyValueRow(stringResource(R.string.attendance_leave_requested_on), it) }
        AppTextArea(
            value = decision.comment,
            onValueChange = onCommentChange,
            label = stringResource(R.string.attendance_leave_comment),
            enabled = !busy,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton(
                text = stringResource(R.string.attendance_leave_reject),
                onClick = onReject,
                enabled = !busy,
                loading = decision.busyAction == ApprovalAction.Reject,
                contentColor = AppColors.Error,
                modifier = Modifier.weight(1f),
            )
            PrimaryButton(
                text = stringResource(R.string.attendance_leave_approve),
                onClick = onApprove,
                enabled = !busy,
                loading = decision.busyAction == ApprovalAction.Approve,
                modifier = Modifier.weight(1f),
            )
        }
    }
}
