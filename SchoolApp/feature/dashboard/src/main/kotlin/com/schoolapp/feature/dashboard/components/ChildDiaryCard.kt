package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.dashboard.R

/** Today's published diary for the child: subject, topics and homework with its due date. */
@Composable
internal fun ChildDiaryCard(entries: List<DiaryEntry>, onOpenDiary: (() -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onOpenDiary) {
        SectionHeader(
            title = stringResource(R.string.dashboard_child_diary_title),
            action = onOpenDiary?.let { open -> { AppTextButton(stringResource(R.string.dashboard_open_diary), open) } },
        )
        if (entries.isEmpty()) {
            Text(
                stringResource(R.string.dashboard_child_diary_empty),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        entries.forEachIndexed { index, entry ->
            if (index > 0) HorizontalDivider(Modifier.padding(vertical = 8.dp), color = AppColors.Border)
            DiaryEntryBlock(entry)
        }
    }
}

@Composable
private fun DiaryEntryBlock(entry: DiaryEntry) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            entry.subjectName ?: stringResource(R.string.dashboard_diary_general),
            style = MaterialTheme.typography.titleSmall,
            color = AppColors.TextPrimary,
        )
        Text(
            entry.topics,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextPrimary,
            maxLines = 3,
            overflow = TextOverflow.Ellipsis,
        )
        entry.homework?.takeIf { it.isNotBlank() }?.let { homework ->
            val due = formatDate(entry.dueDate)
            Text(
                text = if (due != null) {
                    stringResource(R.string.dashboard_homework_due, homework, due)
                } else {
                    stringResource(R.string.dashboard_homework, homework)
                },
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}
