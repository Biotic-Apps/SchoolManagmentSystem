package com.schoolapp.feature.attendance.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Category
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.attendance.R

/** Small lavender pills under a leave card header: working days, type/kind and when it was requested (12-hour). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun LeaveFacts(leave: LeaveRequest, showSubject: Boolean, modifier: Modifier = Modifier) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        FactPill(Icons.Outlined.CalendarMonth, pluralStringResource(R.plurals.attendance_days, leave.days, leave.days))
        if (showSubject) {
            val kind = if (leave.kind == LeaveKind.STAFF) R.string.leave_review_kind_staff else R.string.leave_review_kind_student
            FactPill(Icons.Outlined.Badge, stringResource(kind))
        }
        if (showSubject && leave.kind == LeaveKind.STAFF) {
            leave.type?.let { FactPill(Icons.Outlined.Category, leaveTypeLabel(it)) }
        }
        formatTimestamp(leave.createdAt)?.let { FactPill(Icons.Outlined.Schedule, stringResource(R.string.leave_requested_on, it)) }
    }
}

@Composable
private fun FactPill(icon: ImageVector, text: String) {
    Row(
        Modifier.background(AppColors.Accent, RoundedCornerShape(50)).padding(horizontal = 10.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Icon(icon, contentDescription = null, tint = AppColors.Primary, modifier = Modifier.size(14.dp))
        Text(text, style = MaterialTheme.typography.labelSmall, color = AppColors.TextPrimary)
    }
}
