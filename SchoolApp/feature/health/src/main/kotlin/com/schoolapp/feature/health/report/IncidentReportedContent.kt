package com.schoolapp.feature.health.report

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.components.IncidentCard

@Composable
internal fun IncidentReportedContent(incident: Incident, onDone: () -> Unit, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(16.dp), contentAlignment = Alignment.TopCenter) {
        Column(
            modifier = Modifier.widthIn(max = 840.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Icon(Icons.Outlined.CheckCircle, contentDescription = null, tint = AppColors.Success, modifier = Modifier.size(56.dp))
            Text(
                stringResource(R.string.health_reported_title),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary,
                textAlign = TextAlign.Center,
            )
            val notified = if (incident.severity == IncidentSeverity.SERIOUS) {
                R.string.health_notified_guardians_principal
            } else {
                R.string.health_notified_guardians
            }
            InlineMessage(stringResource(notified), StatusTone.Success)
            IncidentCard(incident)
            PrimaryButton(stringResource(R.string.health_done), onDone, modifier = Modifier.fillMaxWidth())
        }
    }
}
