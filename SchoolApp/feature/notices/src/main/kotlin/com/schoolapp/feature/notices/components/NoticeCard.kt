package com.schoolapp.feature.notices.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.notices.R

/** Feed row: pin icon, unread dot + bold title, two-line body preview, author and date. */
@Composable
internal fun NoticeCard(notice: Notice, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val unreadLabel = stringResource(R.string.notices_unread)
    AppCard(modifier = modifier, onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (!notice.isRead) {
                    Box(
                        Modifier
                            .size(8.dp)
                            .background(AppColors.Primary, CircleShape)
                            .semantics { contentDescription = unreadLabel },
                    )
                }
                Text(
                    text = notice.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = if (notice.isRead) FontWeight.Normal else FontWeight.SemiBold,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                if (notice.pinned) {
                    Icon(
                        Icons.Outlined.PushPin,
                        contentDescription = stringResource(R.string.notices_pinned),
                        tint = AppColors.Primary,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }
            Text(
                text = notice.body,
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = noticeByline(notice),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                if (notice.status != NoticeStatus.PUBLISHED) {
                    StatusChip(noticeStatusLabel(notice.status), statusTone(notice.status.name), Modifier.padding(start = 4.dp))
                }
            }
        }
    }
}

@Composable
internal fun noticeByline(notice: Notice): String =
    listOfNotNull(notice.authorName, formatTimestamp(notice.publishedAt)).joinToString(" · ")

@Composable
internal fun noticeStatusLabel(status: NoticeStatus): String = stringResource(
    when (status) {
        NoticeStatus.DRAFT -> R.string.notices_status_draft
        NoticeStatus.PENDING_REVIEW -> R.string.notices_status_pending
        NoticeStatus.PUBLISHED -> R.string.notices_status_published
        NoticeStatus.EXPIRED -> R.string.notices_status_expired
    },
)
