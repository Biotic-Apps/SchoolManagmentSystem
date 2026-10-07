package com.schoolapp.feature.messages.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Done
import androidx.compose.material.icons.outlined.DoneAll
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.NotificationsOff
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.feature.messages.R

/** Delivery state shown in a bubble's footer. */
enum class BubbleStatus { RECEIVED, SENT, READ, SENDING, FAILED }

/** Chat bubble: mine on the right in the soft selected colour, others on the left on surface with a border. */
@Composable
internal fun MessageBubble(
    body: String,
    attachments: List<Attachment>,
    mine: Boolean,
    senderName: String?,
    time: String?,
    status: BubbleStatus,
    onOpenAttachment: (Attachment) -> Unit,
    modifier: Modifier = Modifier,
    silent: Boolean = false,
    onRetry: (() -> Unit)? = null,
) {
    val shape = if (mine) MineShape else OthersShape
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = if (mine) 48.dp else 0.dp, end = if (mine) 0.dp else 48.dp),
        contentAlignment = if (mine) Alignment.CenterEnd else Alignment.CenterStart,
    ) {
        Column(horizontalAlignment = if (mine) Alignment.End else Alignment.Start, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Column(
                modifier = Modifier
                    .clip(shape)
                    .background(if (mine) AppColors.Selected else AppColors.Surface)
                    .then(if (mine) Modifier else Modifier.border(BorderStroke(1.dp, AppColors.Border), shape))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                if (!mine && !senderName.isNullOrBlank()) {
                    Text(senderName, style = MaterialTheme.typography.labelMedium, color = AppColors.Primary)
                }
                if (body.isNotBlank()) {
                    Text(body, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                }
                AttachmentChips(
                    items = attachments.map { AttachmentChipItem(it.id, it.name.orEmpty(), it.isImage) },
                    onOpen = { item -> attachments.firstOrNull { it.id == item.id }?.let(onOpenAttachment) },
                )
                BubbleFooter(time, status, Modifier.align(Alignment.End))
            }
            if (status == BubbleStatus.FAILED && onRetry != null) {
                Note(
                    text = stringResource(R.string.messages_not_sent),
                    icon = Icons.Outlined.ErrorOutline,
                    error = true,
                    modifier = Modifier.clickable(onClick = onRetry),
                )
            }
            if (silent) {
                Note(stringResource(R.string.messages_delivered_silently), Icons.Outlined.NotificationsOff, error = false)
            }
        }
    }
}

@Composable
private fun BubbleFooter(time: String?, status: BubbleStatus, modifier: Modifier = Modifier) {
    val icon: ImageVector? = when (status) {
        BubbleStatus.RECEIVED -> null
        BubbleStatus.SENT -> Icons.Outlined.Done
        BubbleStatus.READ -> Icons.Outlined.DoneAll
        BubbleStatus.SENDING -> Icons.Outlined.Schedule
        BubbleStatus.FAILED -> Icons.Outlined.ErrorOutline
    }
    val label: String? = when (status) {
        BubbleStatus.READ -> stringResource(R.string.messages_read)
        BubbleStatus.SENDING -> stringResource(R.string.messages_sending)
        else -> null
    }
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
        if (status != BubbleStatus.SENDING && time != null) {
            Text(time, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
        }
        if (icon != null) {
            val tint = when (status) {
                BubbleStatus.READ -> AppColors.Primary
                BubbleStatus.FAILED -> AppColors.Error
                else -> AppColors.TextSecondary
            }
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(14.dp))
        }
        if (label != null) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary)
        }
    }
}

@Composable
private fun Note(text: String, icon: ImageVector, error: Boolean, modifier: Modifier = Modifier) {
    val color = if (error) AppColors.Error else AppColors.TextSecondary
    Row(
        modifier = modifier.padding(horizontal = 4.dp, vertical = 2.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
        Text(text, style = MaterialTheme.typography.labelSmall, color = color)
    }
}

private val MineShape = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp, bottomStart = 12.dp, bottomEnd = 4.dp)
private val OthersShape = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp, bottomStart = 4.dp, bottomEnd = 12.dp)
