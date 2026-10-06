package com.schoolapp.feature.exams.results.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.exams.R

/** A teacher's note visible to parents: category, text, author and date. */
@Composable
internal fun TeacherNoteCard(note: ProgressNote, modifier: Modifier = Modifier) {
    AppCard(modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StatusChip(categoryLabel(note.category), note.category.tone())
                Spacer(Modifier.width(8.dp))
                Text(
                    formatDate(note.createdAt).orEmpty(),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                    textAlign = TextAlign.End,
                    modifier = Modifier.weight(1f),
                )
            }
            Text(note.note, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            note.author?.name?.let {
                Text(stringResource(R.string.exams_note_by, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
}

@Composable
private fun categoryLabel(category: ProgressCategory): String = stringResource(
    when (category) {
        ProgressCategory.HOMEWORK -> R.string.exams_note_homework
        ProgressCategory.BEHAVIOUR -> R.string.exams_note_behaviour
        ProgressCategory.LEARNING -> R.string.exams_note_learning
        ProgressCategory.ACHIEVEMENT -> R.string.exams_note_achievement
    },
)

private fun ProgressCategory.tone(): StatusTone = when (this) {
    ProgressCategory.HOMEWORK -> StatusTone.Info
    ProgressCategory.BEHAVIOUR -> StatusTone.Warning
    ProgressCategory.LEARNING -> StatusTone.Neutral
    ProgressCategory.ACHIEVEMENT -> StatusTone.Success
}
