package com.schoolapp.feature.health.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Sms
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.health.R

/** A person to phone in an emergency, with large Call / SMS buttons. [priority] null hides the badge (doctor). */
@Composable
internal fun EmergencyContactCard(
    name: String,
    relation: String?,
    phone: String,
    priority: Int?,
    onCall: () -> Unit,
    onSms: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f)) {
                Text(name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
                val supporting = listOfNotNull(relation?.takeIf { it.isNotBlank() }, phone).joinToString(" · ")
                Text(supporting, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            }
            if (priority != null) {
                Spacer(Modifier.width(8.dp))
                StatusChip(stringResource(R.string.health_priority, priority), StatusTone.Info)
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            PrimaryButton(
                text = stringResource(R.string.health_call),
                onClick = onCall,
                leadingIcon = Icons.Outlined.Call,
                modifier = Modifier.weight(1f),
            )
            if (onSms != null) {
                SecondaryButton(
                    text = stringResource(R.string.health_sms),
                    onClick = onSms,
                    leadingIcon = Icons.Outlined.Sms,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}
