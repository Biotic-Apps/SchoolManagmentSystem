package com.schoolapp.feature.timetable.builder

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R

/** Placed vs required per subject: "English · Ms Sana", "4/6"; over target in red, done in green. */
@Composable
internal fun LessonsSummarySheet(state: BuilderUiState, onDismiss: () -> Unit) {
    val builder = state.builder ?: return
    AppBottomSheet(title = stringResource(R.string.tt_lessons_title), onDismiss = onDismiss) {
        if (builder.lessons.isEmpty()) {
            Text(stringResource(R.string.tt_no_subjects), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        builder.lessons.forEach { lesson ->
            val target = lesson.periodsPerWeek
            val tone = when {
                target == null -> StatusTone.Neutral
                lesson.placed > target -> StatusTone.Error
                lesson.placed == target -> StatusTone.Success
                else -> StatusTone.Warning
            }
            ListItemRow(
                title = lesson.subject.name,
                supporting = lesson.teacher?.name ?: stringResource(R.string.tt_no_teacher),
                trailing = { StatusChip(target?.let { "${lesson.placed}/$it" } ?: lesson.placed.toString(), tone) },
            )
        }
    }
}
