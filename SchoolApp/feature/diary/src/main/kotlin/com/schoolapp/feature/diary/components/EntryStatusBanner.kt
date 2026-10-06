package com.schoolapp.feature.diary.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.feature.diary.R

/** Current status of the entry being edited, with the reviewer's comment when it was returned. */
@Composable
internal fun EntryStatusBanner(entry: DiaryEntry, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    stringResource(R.string.diary_current_status),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                StatusChip(diaryStatusLabel(entry.status), entry.status.tone())
            }
            entry.authorName?.let {
                Text(stringResource(R.string.diary_written_by, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            when (entry.status) {
                DiaryStatus.RETURNED -> InlineMessage(
                    stringResource(R.string.diary_returned_comment, entry.comment?.takeIf { it.isNotBlank() } ?: "-"),
                    StatusTone.Error,
                )
                DiaryStatus.PUBLISHED -> InlineMessage(stringResource(R.string.diary_published_edit_note), StatusTone.Info)
                DiaryStatus.SUBMITTED, DiaryStatus.PENDING_REVIEW -> InlineMessage(stringResource(R.string.diary_waiting_review_note), StatusTone.Warning)
                DiaryStatus.DRAFT -> Unit
            }
        }
    }
}
