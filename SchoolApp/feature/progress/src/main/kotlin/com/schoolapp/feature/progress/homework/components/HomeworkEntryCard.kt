package com.schoolapp.feature.progress.homework.components

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
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.progress.R

/** A diary entry's homework; tappable in the list, or with a "Change" action once picked. */
@Composable
internal fun HomeworkEntryCard(
    entry: DiaryEntry,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    onChange: (() -> Unit)? = null,
) {
    AppCard(modifier = modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    entry.subjectName?.let { stringResource(R.string.progress_subject_homework, it) }
                        ?: stringResource(R.string.progress_homework_fallback),
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                )
                Text(entry.homework.orEmpty(), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                formatDate(entry.dueDate)?.let {
                    Text(stringResource(R.string.progress_due, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            onChange?.let { AppTextButton(stringResource(R.string.progress_change_entry), it) }
        }
    }
}
