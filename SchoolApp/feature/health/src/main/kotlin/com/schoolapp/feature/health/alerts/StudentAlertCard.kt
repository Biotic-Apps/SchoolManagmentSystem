package com.schoolapp.feature.health.alerts

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.feature.health.R

/** A student's allergies, conditions and medical instructions; tapping opens the health card. */
@Composable
internal fun StudentAlertCard(alert: HealthAlert, onOpen: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onOpen, verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (alert.allergies.isNotEmpty()) {
                Icon(Icons.Outlined.WarningAmber, contentDescription = null, tint = AppColors.Error, modifier = Modifier.size(20.dp))
            }
            Text(
                alert.studentName ?: stringResource(R.string.health_alert_unknown_student),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary,
            )
        }
        if (alert.allergies.isNotEmpty()) {
            Text(
                stringResource(R.string.health_alert_allergies, alert.allergies.joinToString(", ")),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.Error,
            )
        }
        if (alert.conditions.isNotEmpty()) {
            Text(
                stringResource(R.string.health_alert_conditions, alert.conditions.joinToString(", ")),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextPrimary,
            )
        }
        alert.instructions?.takeIf { it.isNotBlank() }?.let { InlineMessage(it, StatusTone.Warning) }
    }
}
