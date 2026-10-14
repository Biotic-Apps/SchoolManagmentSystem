package com.schoolapp.feature.students.detail.health

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.students.R

/** Health incidents recorded for the student, newest first. */
@Composable
internal fun StudentIncidentsCard(incidents: List<Incident>) {
    HealthCard(R.string.sd_health_incidents) {
        if (incidents.isEmpty()) Muted(stringResource(R.string.sd_health_no_incidents))
        incidents.forEachIndexed { index, incident ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            IncidentRow(incident)
        }
    }
}

@Composable
private fun IncidentRow(incident: Incident) {
    Column(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                humanizeKey(incident.type.name),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(humanizeKey(incident.severity.name), severityTone(incident.severity.name))
            incident.status?.let { StatusChip(humanizeKey(it), statusTone(it)) }
        }
        Text(incident.description, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
        incident.actionTaken?.takeIf { it.isNotBlank() }?.let {
            Text(stringResource(R.string.sd_health_action_taken, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        val meta = listOfNotNull(formatTimestamp(incident.occurredAt), incident.reportedByName).joinToString(" · ")
        if (meta.isNotEmpty()) Text(meta, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
    }
}
