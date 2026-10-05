package com.schoolapp.feature.profile.sessions.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Computer
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.profile.DeviceSession
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.profile.R

@Composable
internal fun DeviceSessionCard(
    session: DeviceSession,
    revoking: Boolean,
    onRevoke: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(
                imageVector = if (session.platform == "WEB") Icons.Outlined.Computer else Icons.Outlined.PhoneAndroid,
                contentDescription = null,
                tint = AppColors.TextSecondary,
                modifier = Modifier.size(24.dp),
            )
            Column(Modifier.weight(1f)) {
                Text(
                    text = session.deviceName ?: stringResource(R.string.sessions_unknown_device),
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextPrimary,
                )
                val details = listOfNotNull(session.platform, session.ip, formatTimestamp(session.lastUsedAt))
                Text(details.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            if (session.current) {
                StatusChip(stringResource(R.string.sessions_this_device), StatusTone.Success)
            } else {
                AppTextButton(
                    text = stringResource(R.string.sessions_revoke),
                    onClick = onRevoke,
                    loading = revoking,
                    contentColor = AppColors.Error,
                )
            }
        }
    }
}
