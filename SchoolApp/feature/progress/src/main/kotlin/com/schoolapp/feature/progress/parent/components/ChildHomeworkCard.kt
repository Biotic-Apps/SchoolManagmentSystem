package com.schoolapp.feature.progress.parent.components

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
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.progress.R

/** One homework of the child: subject, date set, text, due date and the teacher's tick. */
@Composable
internal fun ChildHomeworkCard(item: HomeworkCompletionItem, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Column(Modifier.weight(1f)) {
                    Text(
                        item.subjectName ?: stringResource(R.string.progress_homework_fallback),
                        style = MaterialTheme.typography.titleMedium,
                        color = AppColors.TextPrimary,
                    )
                    formatDate(item.date)?.let {
                        Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                }
                HomeworkStatusChip(item.status)
            }
            Text(item.homework, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            formatDate(item.dueDate)?.let {
                Text(stringResource(R.string.progress_due, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
}
