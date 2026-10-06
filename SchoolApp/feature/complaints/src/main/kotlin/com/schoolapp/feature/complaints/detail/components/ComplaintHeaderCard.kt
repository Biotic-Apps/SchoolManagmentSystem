package com.schoolapp.feature.complaints.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.categoryLabel
import com.schoolapp.feature.complaints.components.statusLabel
import com.schoolapp.feature.complaints.components.tone

/** Ticket, subject, status chips, SLA due time (12-hour) and the description. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ComplaintHeaderCard(complaint: Complaint, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(complaint.ticketNo, style = MaterialTheme.typography.labelLarge, color = AppColors.Primary)
            Text(complaint.subject, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                StatusChip(statusLabel(complaint.status), complaint.status.tone())
                StatusChip(categoryLabel(complaint.category), StatusTone.Neutral)
                if (complaint.overdue) StatusChip(stringResource(R.string.complaints_overdue), StatusTone.Error)
                if (complaint.escalationLevel > 0) {
                    StatusChip(stringResource(R.string.complaints_escalation_level, complaint.escalationLevel), StatusTone.Warning)
                }
            }
            if (complaint.isOpen) {
                formatTimestamp(complaint.slaDueAt)?.let {
                    Text(
                        stringResource(R.string.complaints_sla_due, it),
                        style = MaterialTheme.typography.bodySmall,
                        color = if (complaint.overdue) AppColors.Error else AppColors.TextSecondary,
                    )
                }
            }
            Text(complaint.description, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
        }
    }
}
