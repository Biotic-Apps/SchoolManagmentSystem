package com.schoolapp.feature.exams.schedule.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.schedule.RowProblem
import com.schoolapp.feature.exams.schedule.ScheduleRow

/** One paper: subject, date, 12-hour times, marks and room; tap to edit, bin to remove (when editable). */
@Composable
internal fun PaperRowCard(
    row: ScheduleRow,
    subjectName: String?,
    roomName: String?,
    problems: List<RowProblem>,
    clashes: List<String>,
    onClick: (() -> Unit)?,
    onRemove: (() -> Unit)?,
) {
    val hasIssue = problems.isNotEmpty() || clashes.isNotEmpty()
    AppCard(onClick = onClick, tone = if (hasIssue) StatusTone.Error else null) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    subjectName ?: stringResource(R.string.exams_schedule_choose_subject),
                    style = MaterialTheme.typography.titleSmall,
                    color = AppColors.TextPrimary,
                )
                val time = stringResource(
                    R.string.exams_schedule_time_range,
                    formatTime(row.startTime) ?: row.startTime,
                    formatTime(row.endTime) ?: row.endTime,
                )
                val dateLine = listOfNotNull(formatDate(row.date) ?: row.date.ifBlank { null }, time, roomName).joinToString(" · ")
                Text(dateLine, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                Text(
                    stringResource(R.string.exams_schedule_marks_line, row.maxMarks, row.passMarks),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
            if (onRemove != null) {
                IconButton(onClick = onRemove) {
                    Icon(Icons.Outlined.DeleteOutline, contentDescription = stringResource(R.string.exams_schedule_remove), tint = AppColors.Error)
                }
            }
        }
        (problems.map { problemText(it) } + clashes).forEach {
            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
    }
}

@Composable
@ReadOnlyComposable
internal fun problemText(problem: RowProblem): String = stringResource(
    when (problem) {
        RowProblem.SUBJECT_MISSING -> R.string.exams_problem_subject_missing
        RowProblem.SUBJECT_TWICE -> R.string.exams_problem_subject_twice
        RowProblem.DATE_MISSING -> R.string.exams_problem_date_missing
        RowProblem.END_BEFORE_START -> R.string.exams_problem_end_before_start
        RowProblem.MAX_INVALID -> R.string.exams_problem_max_invalid
        RowProblem.PASS_INVALID -> R.string.exams_problem_pass_invalid
        RowProblem.PASS_ABOVE_MAX -> R.string.exams_problem_pass_above_max
    },
)
