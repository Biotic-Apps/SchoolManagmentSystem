package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.feature.attendance.R

/** One leave request; [onCancel] shows a cancel action while it is still SUBMITTED. */
@Composable
internal fun LeaveRequestCard(
    leave: LeaveRequest,
    modifier: Modifier = Modifier,
    showSubject: Boolean = false,
    onClick: (() -> Unit)? = null,
    onCancel: (() -> Unit)? = null,
    cancelling: Boolean = false,
) {
    val range = formatDateRange(leave.from, leave.to).orEmpty()
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(
                        if (showSubject) leave.subject.name else range,
                        style = MaterialTheme.typography.titleSmall,
                        color = AppColors.TextPrimary,
                    )
                    val detail = listOfNotNull(
                        range.takeIf { showSubject },
                        pluralStringResource(R.plurals.attendance_days, leave.days, leave.days),
                        leave.type?.let { leaveTypeLabel(it) },
                        stringResource(R.string.attendance_leave_kind_staff).takeIf { showSubject && leave.kind == LeaveKind.STAFF },
                    ).joinToString(" · ")
                    Text(detail, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                Spacer(Modifier.width(8.dp))
                StatusChip(leaveStatusLabel(leave.status), leave.status.tone())
            }
            Text(
                leave.reason,
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextPrimary,
                maxLines = if (onClick != null) PREVIEW_LINES else Int.MAX_VALUE,
                overflow = TextOverflow.Ellipsis,
            )
            leave.decidedBy?.let { decidedBy ->
                val text = listOfNotNull(
                    stringResource(R.string.attendance_leave_decided_by, decidedBy.name),
                    leave.comment?.takeIf { it.isNotBlank() },
                ).joinToString(" – ")
                Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            if (onCancel != null && leave.status == LeaveStatus.SUBMITTED) {
                AppTextButton(
                    text = stringResource(R.string.attendance_leave_cancel),
                    onClick = onCancel,
                    loading = cancelling,
                    contentColor = AppColors.Error,
                )
            }
        }
    }
}

private const val PREVIEW_LINES = 3
