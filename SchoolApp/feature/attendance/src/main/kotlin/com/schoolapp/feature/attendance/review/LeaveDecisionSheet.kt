package com.schoolapp.feature.attendance.review

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Cancel
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.leaveTypeLabel

/** Decide one pending request: who and when, the reason, an optional note, then approve and/or reject. */
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
    AppBottomSheet(title = stringResource(R.string.leave_review_details), onDismiss = onDismiss) {
        decision.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PersonAvatar(name = leave.subject.name, photoUrl = null)
            Column(Modifier.weight(1f)) {
                Text(leave.subject.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(formatDateRange(leave.from, leave.to).orEmpty(), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            val kind = if (leave.kind == LeaveKind.STAFF) R.string.leave_review_kind_staff else R.string.leave_review_kind_student
            StatusChip(stringResource(kind), StatusTone.Info)
        }
        AppCard(verticalSpacing = 4.dp) {
            KeyValueRow(stringResource(R.string.attendance_leave_days), pluralStringResource(R.plurals.attendance_days, leave.days, leave.days))
            if (leave.kind == LeaveKind.STAFF) leave.type?.let { KeyValueRow(stringResource(R.string.attendance_leave_type), leaveTypeLabel(it)) }
            leave.requestedBy?.let { KeyValueRow(stringResource(R.string.attendance_leave_requested_by), it.name) }
            formatTimestamp(leave.createdAt)?.let { KeyValueRow(stringResource(R.string.attendance_leave_requested_on), it) }
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stringResource(R.string.leave_review_reason), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
            Text(leave.reason, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
        }
        AppTextArea(
            value = decision.comment,
            onValueChange = onCommentChange,
            label = stringResource(R.string.leave_review_comment_hint),
            supportingText = stringResource(R.string.leave_form_reason_counter, decision.comment.length, LeaveReviewViewModel.COMMENT_MAX),
            enabled = !busy,
        )
        Text(stringResource(R.string.leave_review_decision_note), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        DecisionButtons(decision, onApprove, onReject)
    }
}

@Composable
private fun DecisionButtons(decision: LeaveDecision, onApprove: () -> Unit, onReject: () -> Unit) {
    val busy = decision.busyAction != null
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        if (decision.intent != ApprovalAction.Approve) {
            SecondaryButton(
                text = stringResource(R.string.attendance_leave_reject),
                onClick = onReject,
                enabled = !busy,
                loading = decision.busyAction == ApprovalAction.Reject,
                contentColor = AppColors.Error,
                leadingIcon = Icons.Outlined.Cancel,
                modifier = Modifier.weight(1f),
            )
        }
        if (decision.intent != ApprovalAction.Reject) {
            PrimaryButton(
                text = stringResource(R.string.attendance_leave_approve),
                onClick = onApprove,
                enabled = !busy,
                loading = decision.busyAction == ApprovalAction.Approve,
                leadingIcon = Icons.Outlined.CheckCircle,
                modifier = Modifier.weight(1f),
            )
        }
    }
}
