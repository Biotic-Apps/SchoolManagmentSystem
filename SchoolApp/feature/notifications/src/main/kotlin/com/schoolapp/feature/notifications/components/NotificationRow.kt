package com.schoolapp.feature.notifications.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notification.AppNotification
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.notifications.R

@Composable
internal fun NotificationRow(item: AppNotification, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val unreadLabel = stringResource(R.string.notifications_unread)
    ListItemRow(
        title = item.title,
        supporting = listOfNotNull(item.body, formatTimestamp(item.createdAt)).joinToString("\n"),
        leadingIcon = Icons.Outlined.Notifications,
        selected = !item.isRead,
        onClick = onClick,
        modifier = modifier.semantics { if (!item.isRead) stateDescription = unreadLabel },
        trailing = {
            if (!item.isRead) Box(Modifier.size(10.dp).background(AppColors.Primary, CircleShape))
        },
    )
}
