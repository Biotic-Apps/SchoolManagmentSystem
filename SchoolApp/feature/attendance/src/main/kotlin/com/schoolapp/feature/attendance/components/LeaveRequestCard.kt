package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.feature.attendance.R

/**
 * One leave request: type/subject header with a status chip, dates and day count, the reason, the decision
 * (who decided and their note) and an optional [actions] row (cancel, approve/reject).
 */
@Composable
internal fun LeaveRequestCard(
    leave: LeaveRequest,
    modifier: Modifier = Modifier,
    showSubject: Boolean = false,
    onClick: (() -> Unit)? = null,
    actions: (@Composable RowScope.() -> Unit)? = null,
) {
    AppCard(modifier = modifier.fillMaxWidth(), onClick = onClick, verticalSpacing = 12.dp) {
        LeaveCardHeader(leave, showSubject)
        LeaveFacts(leave, showSubject)
        Text(
            leave.reason,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextPrimary,
            maxLines = if (onClick != null) PREVIEW_LINES else Int.MAX_VALUE,
            overflow = TextOverflow.Ellipsis,
        )
        leave.decidedBy?.let { DecisionNote(it.name, leave.comment) }
        if (actions != null) {
            HorizontalDivider(color = AppColors.Border)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End), content = actions)
        }
    }
}

@Composable
private fun LeaveCardHeader(leave: LeaveRequest, showSubject: Boolean) {
    val title = when {
        showSubject -> leave.subject.name
        leave.kind == LeaveKind.STAFF && leave.type != null -> leaveTypeLabel(leave.type!!)
        else -> leave.subject.name.ifBlank { stringResource(R.string.attendance_segment_leave) }
    }
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        IconTile(leave.displayIcon(), leave.status.tone(), size = 40.dp)
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(
                formatDateRange(leave.from, leave.to).orEmpty(),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        StatusChip(leaveStatusLabel(leave.status), leave.status.tone(), icon = leave.status.icon())
    }
}

@Composable
private fun DecisionNote(decidedBy: String, comment: String?) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(
            stringResource(R.string.attendance_leave_decided_by, decidedBy),
            style = MaterialTheme.typography.labelMedium,
            color = AppColors.TextSecondary,
        )
        comment?.takeIf { it.isNotBlank() }?.let {
            Text(stringResource(R.string.leave_decision_comment, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextPrimary)
        }
    }
}

private const val PREVIEW_LINES = 3
