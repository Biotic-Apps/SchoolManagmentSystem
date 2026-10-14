package com.schoolapp.feature.notices.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.notices.R

/** Management row: title, status, audience, author / date, attachment count and an optional Publish action. */
@Composable
internal fun ManageNoticeCard(
    notice: Notice,
    onClick: () -> Unit,
    onPublish: (() -> Unit)?,
    publishing: Boolean,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier, onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    notice.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                if (notice.pinned) {
                    Icon(Icons.Outlined.PushPin, stringResource(R.string.notices_pinned), tint = AppColors.Primary, modifier = Modifier.size(18.dp))
                }
                StatusChip(noticeStatusLabel(notice.status), statusTone(notice.status.name))
            }
            Text(audienceSummary(notice.audience), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    listOfNotNull(notice.authorName, formatTimestamp(notice.publishedAt ?: notice.createdAt)).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                if (notice.attachments.isNotEmpty()) {
                    Icon(Icons.Outlined.AttachFile, null, tint = AppColors.TextSecondary, modifier = Modifier.size(16.dp))
                    Text(notice.attachments.size.toString(), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            onPublish?.let { publish ->
                SecondaryButton(
                    text = stringResource(R.string.notices_publish),
                    onClick = publish,
                    loading = publishing,
                    leadingIcon = Icons.AutoMirrored.Outlined.Send,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
