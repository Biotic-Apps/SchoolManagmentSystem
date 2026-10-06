package com.schoolapp.feature.exams.results.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.TabularNumbers
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.SubjectResult
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks

private val MarksColumn = 84.dp
private val GradeColumn = 44.dp
private val ResultColumn = 72.dp

/** Subject | marks/max (right aligned, tabular) | grade | pass/fail or Absent. Subject names wrap. */
@Composable
internal fun SubjectsTable(subjects: List<SubjectResult>, modifier: Modifier = Modifier) {
    Column(modifier) {
        val header = MaterialTheme.typography.labelMedium
        TableRow(
            subject = { Text(stringResource(R.string.exams_col_subject), style = header, color = AppColors.TextSecondary) },
            marks = { Text(stringResource(R.string.exams_col_marks), style = header, color = AppColors.TextSecondary, textAlign = TextAlign.End) },
            grade = { Text(stringResource(R.string.exams_col_grade), style = header, color = AppColors.TextSecondary, textAlign = TextAlign.Center) },
            result = { Text(stringResource(R.string.exams_col_result), style = header, color = AppColors.TextSecondary) },
        )
        subjects.forEach { subject ->
            HorizontalDivider(color = AppColors.Border)
            val body = MaterialTheme.typography.bodyMedium
            TableRow(
                subject = { Text(subject.name, style = body, color = AppColors.TextPrimary) },
                marks = {
                    val marks = subject.marks
                    Text(
                        if (subject.absent || marks == null) "-" else stringResource(R.string.exams_marks_of_max, formatMarks(marks), formatMarks(subject.maxMarks)),
                        style = body.tabular(),
                        color = AppColors.TextPrimary,
                        textAlign = TextAlign.End,
                    )
                },
                grade = { Text(subject.grade ?: "-", style = body, color = AppColors.TextPrimary, textAlign = TextAlign.Center) },
                result = {
                    when {
                        subject.absent -> StatusChip(stringResource(R.string.exams_absent), StatusTone.Neutral)
                        subject.passed -> StatusChip(stringResource(R.string.exams_pass), StatusTone.Success)
                        else -> StatusChip(stringResource(R.string.exams_fail), StatusTone.Error)
                    }
                },
            )
        }
    }
}

@Composable
private fun TableRow(
    subject: @Composable () -> Unit,
    marks: @Composable () -> Unit,
    grade: @Composable () -> Unit,
    result: @Composable () -> Unit,
) {
    Row(Modifier.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.weight(1f)) { subject() }
        Spacer(Modifier.width(8.dp))
        Box(Modifier.width(MarksColumn), contentAlignment = Alignment.CenterEnd) { marks() }
        Box(Modifier.width(GradeColumn), contentAlignment = Alignment.Center) { grade() }
        Box(Modifier.width(ResultColumn), contentAlignment = Alignment.CenterEnd) { result() }
    }
}

private fun TextStyle.tabular(): TextStyle = copy(fontFeatureSettings = TabularNumbers)
