package com.schoolapp.feature.diary.teacher

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.components.diaryStatusLabel
import com.schoolapp.feature.diary.components.tone

/** A section's subjects for the day with their diary status; tapping a line opens the editor for that subject. */
@Composable
internal fun SectionDiaryCard(
    section: SectionDiary,
    onAdd: () -> Unit,
    onOpenRow: (DiaryRow) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier) {
        SectionHeader(
            title = section.title,
            action = { AppTextButton(stringResource(R.string.diary_add_entry), onAdd, leadingIcon = Icons.Outlined.Add) },
        )
        AppCard(contentPadding = 0.dp) {
            if (section.rows.isEmpty()) {
                Text(
                    stringResource(R.string.diary_section_empty),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.padding(16.dp),
                )
            }
            section.rows.forEachIndexed { index, row ->
                if (index > 0) HorizontalDivider(color = AppColors.Border)
                DiaryRowItem(row, onClick = { onOpenRow(row) })
            }
        }
    }
}

@Composable
private fun DiaryRowItem(row: DiaryRow, onClick: () -> Unit) {
    val entry = row.entry
    val supporting = when {
        entry != null -> entry.topics
        row.queued -> stringResource(R.string.diary_saved_on_phone)
        else -> stringResource(R.string.diary_not_written)
    }
    Column {
        ListItemRow(
            title = row.subjectName ?: stringResource(R.string.diary_subject_unknown),
            supporting = supporting,
            onClick = onClick,
            trailing = {
                when {
                    row.queued -> StatusChip(stringResource(R.string.diary_status_waiting_sync), StatusTone.Info)
                    entry != null -> StatusChip(diaryStatusLabel(entry.status), entry.status.tone())
                    else -> StatusChip(stringResource(R.string.diary_status_not_written), StatusTone.Neutral)
                }
            },
        )
        val comment = entry?.comment
        if (entry?.status == DiaryStatus.RETURNED && !comment.isNullOrBlank()) {
            InlineMessage(
                stringResource(R.string.diary_returned_comment, comment),
                StatusTone.Error,
                Modifier.padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
            )
        }
    }
}
