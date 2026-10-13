package com.schoolapp.feature.health.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.ui.attachments.AttachmentLinks
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.health.R

/** One first-aid incident; [showStudent] is off on a single student's card. [onClose] null hides the action. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun IncidentCard(
    incident: Incident,
    modifier: Modifier = Modifier,
    showStudent: Boolean = true,
    closing: Boolean = false,
    onClose: (() -> Unit)? = null,
) {
    AppCard(modifier.fillMaxWidth()) {
        val title = if (showStudent) incident.studentName ?: incidentTypeLabel(incident.type) else incidentTypeLabel(incident.type)
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
        Spacer(Modifier.height(4.dp))
        val subtitle = listOfNotNull(
            incidentTypeLabel(incident.type).takeIf { showStudent },
            formatTimestamp(incident.occurredAt),
        ).joinToString(" · ")
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        Spacer(Modifier.height(8.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            StatusChip(severityLabel(incident.severity), incident.severity.tone())
            incident.status?.let { StatusChip(incidentStatusLabel(it), incidentStatusTone(it)) }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            incident.description,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextPrimary,
            maxLines = 4,
            overflow = TextOverflow.Ellipsis,
        )
        incident.actionTaken?.takeIf { it.isNotBlank() }?.let {
            Spacer(Modifier.height(4.dp))
            Text(stringResource(R.string.health_action_taken_value, it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        if (incident.attachments.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            AttachmentLinks(incident.attachments)
        }
        incident.reportedByName?.let {
            Spacer(Modifier.height(4.dp))
            Text(stringResource(R.string.health_reported_by, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        if (onClose != null && incident.status != STATUS_CLOSED) {
            AppTextButton(stringResource(R.string.health_close_incident), onClose, loading = closing)
        }
    }
}
