package com.schoolapp.feature.diary.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.diary.R

/** One subject's entry: topics, homework with due date, attachments; status chip for staff views. */
@Composable
internal fun DiaryEntryCard(
    entry: DiaryEntry,
    onOpenAttachment: (String) -> Unit,
    modifier: Modifier = Modifier,
    showStatus: Boolean = true,
    queued: Boolean = false,
    onClick: (() -> Unit)? = null,
    footer: (@Composable () -> Unit)? = null,
) {
    AppCard(modifier = modifier, onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = entry.subjectName ?: stringResource(R.string.diary_subject_unknown),
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                if (queued) {
                    StatusChip(stringResource(R.string.diary_status_waiting_sync), StatusTone.Info)
                } else if (showStatus) {
                    StatusChip(diaryStatusLabel(entry.status), entry.status.tone())
                }
            }
            LabeledText(stringResource(R.string.diary_topics), entry.topics)
            entry.homework?.takeIf { it.isNotBlank() }?.let { homework ->
                LabeledText(stringResource(R.string.diary_homework), homework)
                formatDate(entry.dueDate)?.let {
                    Text(stringResource(R.string.diary_due_on, it), style = MaterialTheme.typography.bodySmall, color = AppColors.Warning)
                }
            }
            val chips = entry.attachments.map { it.toChip() }
            AttachmentChips(
                items = chips,
                onOpen = { chip -> entry.attachments.firstOrNull { it.id == chip.id }?.url?.let(onOpenAttachment) },
            )
            val comment = entry.comment
            if (showStatus && entry.status == DiaryStatus.RETURNED && !comment.isNullOrBlank()) {
                InlineMessage(stringResource(R.string.diary_returned_comment, comment), StatusTone.Error)
            }
            footer?.invoke()
        }
    }
}

@Composable
private fun LabeledText(label: String, text: String) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
        Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
    }
}
