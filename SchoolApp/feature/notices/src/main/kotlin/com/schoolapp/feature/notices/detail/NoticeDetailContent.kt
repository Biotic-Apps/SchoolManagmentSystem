package com.schoolapp.feature.notices.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentLinks
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.ComposeResultMessage
import com.schoolapp.feature.notices.components.audienceSummary
import com.schoolapp.feature.notices.components.noticeStatusLabel

@Composable
internal fun NoticeDetailContent(
    state: NoticeDetailUiState,
    notice: Notice,
    onEdit: () -> Unit,
    onPublish: () -> Unit,
    onRetryReads: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier) {
        state.message?.let { message -> item(key = "message") { ComposeResultMessage(message) } }
        state.actionError?.let { error -> item(key = "actionError") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "body") { NoticeBodyCard(notice) }
        item(key = "meta") {
            AppCard {
                KeyValueRow(stringResource(R.string.notices_author), notice.authorName)
                KeyValueRow(stringResource(R.string.notices_published_at), formatTimestamp(notice.publishedAt ?: notice.createdAt))
                KeyValueRow(stringResource(R.string.notices_audience), notice.audienceLabel ?: audienceSummary(notice.audience))
                KeyValueRow(stringResource(R.string.notices_expires_on), formatDate(notice.expiresOn) ?: stringResource(R.string.notices_no_expiry))
                KeyValueRow(stringResource(R.string.notices_status), noticeStatusLabel(notice.status))
            }
        }
        if (state.canSeeReads) {
            item(key = "reads") { ReadReceiptsCard(state.reads, state.readsLoading, state.readsError, onRetryReads) }
        }
        if (state.canEdit || state.canPublish) {
            item(key = "actions") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (state.canPublish) {
                        PrimaryButton(
                            stringResource(R.string.notices_publish),
                            onPublish,
                            Modifier.fillMaxWidth(),
                            loading = state.isPublishing,
                            leadingIcon = Icons.AutoMirrored.Outlined.Send,
                        )
                    }
                    if (state.canEdit) {
                        SecondaryButton(
                            stringResource(R.string.notices_edit_draft),
                            onEdit,
                            Modifier.fillMaxWidth(),
                            enabled = !state.isPublishing,
                            leadingIcon = Icons.Outlined.Edit,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NoticeBodyCard(notice: Notice) {
    AppCard {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(notice.title, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
                if (notice.pinned) {
                    Icon(Icons.Outlined.PushPin, stringResource(R.string.notices_pinned), tint = AppColors.Primary)
                }
            }
            Text(notice.body, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            if (notice.attachments.isNotEmpty()) {
                Text(stringResource(R.string.notices_attachments), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
                AttachmentLinks(notice.attachments)
            }
        }
    }
}
