package com.schoolapp.feature.health.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.health.Allergy
import com.schoolapp.feature.health.R

/** Error-toned alert listing every allergy with severity and reaction; shown first on the health card. */
@Composable
internal fun AllergyAlertCard(allergies: List<Allergy>, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = AppColors.ErrorContainer,
        border = BorderStroke(1.dp, AppColors.Error.copy(alpha = 0.4f)),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.WarningAmber, contentDescription = null, tint = AppColors.Error, modifier = Modifier.size(24.dp))
                Spacer(Modifier.width(8.dp))
                Text(
                    stringResource(R.string.health_allergies),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.Error,
                )
            }
            allergies.forEach { allergy ->
                Column {
                    Text(allergy.name, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
                    allergy.severity?.takeIf { it.isNotBlank() }?.let {
                        Text(
                            stringResource(R.string.health_allergy_severity, allergySeverityLabel(it)),
                            style = MaterialTheme.typography.bodyMedium,
                            color = AppColors.Error,
                        )
                    }
                    allergy.reaction?.takeIf { it.isNotBlank() }?.let {
                        Text(stringResource(R.string.health_allergy_reaction, it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                    }
                }
            }
        }
    }
}
