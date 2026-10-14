package com.schoolapp.feature.settings.support

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.FailedNotification
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R

@Composable
internal fun FailedNotificationCard(row: FailedNotification, canEdit: Boolean, resending: Boolean, onResend: () -> Unit) {
    val dash = stringResource(R.string.settings_dash)
    AppCard(verticalSpacing = 2.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(row.recipientName ?: dash, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                row.recipientContact?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
            }
            if (canEdit) {
                AppTextButton(
                    text = stringResource(R.string.settings_support_resend),
                    onClick = onResend,
                    loading = resending,
                    leadingIcon = Icons.Outlined.Replay,
                )
            }
        }
        KeyValueRow(stringResource(R.string.settings_support_when), formatTimestamp(row.at) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_channel), row.channel?.let(::humanizeKey) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_category), row.category?.let(::humanizeKey) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_attempts), row.attempts.toString())
        row.lastError?.let {
            Text(stringResource(R.string.settings_support_last_error, it), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
    }
}
