package com.schoolapp.feature.messages.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.feature.messages.R
import java.time.LocalDate

/** Thread summary card: other party's initials, subject, student, last message, time and unread badge. */
@Composable
internal fun ThreadRow(
    thread: MessageThread,
    myUserId: String?,
    today: LocalDate,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val unread = thread.unreadCount > 0
    val otherName = thread.participants.firstOrNull { it.userId != myUserId }?.name ?: thread.studentName ?: thread.subject
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 0.dp) {
        Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PersonAvatar(name = otherName, photoUrl = null, size = 44.dp)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
                    Text(
                        text = thread.subject,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = if (unread) FontWeight.Bold else FontWeight.SemiBold,
                        color = AppColors.TextPrimary,
                        modifier = Modifier.weight(1f),
                    )
                    MessageTime.listLabel(thread.lastMessageAt, today)?.let {
                        Text(it, style = MaterialTheme.typography.labelSmall, color = if (unread) AppColors.Primary else AppColors.TextSecondary)
                    }
                }
                studentLine(thread)?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = preview(thread),
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (unread) AppColors.TextPrimary else AppColors.TextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                    if (thread.closed) StatusChip(stringResource(R.string.messages_closed), StatusTone.Neutral)
                    if (unread) UnreadBadge(thread.unreadCount)
                }
            }
        }
    }
}

/** "Ayesha Khan · Class 5 A" for the thread's student context. */
@Composable
internal fun studentLine(thread: MessageThread): String? {
    val name = thread.studentName ?: return null
    val classLabel = listOfNotNull(thread.className, thread.sectionName).joinToString(" ").ifBlank { null }
    return if (classLabel == null) name else stringResource(R.string.messages_student_class, name, classLabel)
}

@Composable
private fun preview(thread: MessageThread): String {
    val body = thread.lastMessageBody?.takeIf { it.isNotBlank() } ?: stringResource(R.string.messages_attachment_only)
    val sender = thread.lastSenderName
    return if (sender.isNullOrBlank()) body else stringResource(R.string.messages_preview, sender, body)
}

@Composable
private fun UnreadBadge(count: Int) {
    val description = stringResource(R.string.messages_unread, count)
    Box(
        modifier = Modifier
            .defaultMinSize(minWidth = 22.dp, minHeight = 22.dp)
            .clip(CircleShape)
            .background(AppColors.Primary)
            .padding(horizontal = 6.dp)
            .semantics { contentDescription = description },
        contentAlignment = Alignment.Center,
    ) {
        Text(if (count > 99) "99+" else count.toString(), style = MaterialTheme.typography.labelSmall, color = AppColors.OnPrimary)
    }
}
