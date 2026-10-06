package com.schoolapp.feature.profile.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.profile.R

@Composable
internal fun NotificationsCard(onNotificationPreferences: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = stringResource(R.string.profile_notifications),
            supporting = stringResource(R.string.profile_notifications_hint),
            leadingIcon = Icons.Outlined.Notifications,
            onClick = onNotificationPreferences,
            trailing = {
                Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = null, tint = AppColors.TextSecondary)
            },
        )
    }
}
