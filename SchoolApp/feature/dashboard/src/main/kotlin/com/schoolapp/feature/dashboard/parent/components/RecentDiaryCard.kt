package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
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

/** Recent published diary entries (newest first): subject and date, topics, homework with its due date. */
@Composable
internal fun RecentDiaryCard(entries: List<DiaryEntry>, onOpenDiary: (() -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onOpenDiary) {
        SectionHeader(
            title = stringResource(R.string.dashboard_recent_diary_title),
            action = onOpenDiary?.let { open -> { AppTextButton(stringResource(R.string.dashboard_open_diary), open) } },
        )
        if (entries.isEmpty()) {
            CardEmptyHint(stringResource(R.string.dashboard_recent_diary_empty), stringResource(R.string.dashboard_recent_diary_hint))
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
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                entry.subjectName ?: stringResource(R.string.dashboard_diary_general),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            formatDate(entry.date)?.let { Text(it, style = MaterialTheme.typography.labelSmall, color = AppColors.TextSecondary) }
        }
        Text(entry.topics, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary, maxLines = 3, overflow = TextOverflow.Ellipsis)
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
