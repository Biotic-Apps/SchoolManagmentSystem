package com.schoolapp.feature.complaints.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.complaints.R

/** List card: ticket + created date, subject, category, status / overdue / escalation chips. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ComplaintRow(complaint: Complaint, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    complaint.ticketNo,
                    style = MaterialTheme.typography.labelMedium,
                    color = AppColors.Primary,
                    modifier = Modifier.weight(1f),
                )
                formatDate(complaint.createdAt)?.let {
                    Text(it, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
                }
            }
            Text(complaint.subject, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
            Text(categoryLabel(complaint.category), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                StatusChip(statusLabel(complaint.status), complaint.status.tone())
                if (complaint.overdue) StatusChip(stringResource(R.string.complaints_overdue), StatusTone.Error)
                if (complaint.escalationLevel > 0) {
                    StatusChip(stringResource(R.string.complaints_escalation_level, complaint.escalationLevel), StatusTone.Warning)
                }
            }
        }
    }
}
