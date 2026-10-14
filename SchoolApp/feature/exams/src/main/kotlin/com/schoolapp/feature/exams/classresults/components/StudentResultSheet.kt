package com.schoolapp.feature.exams.classresults.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks
import com.schoolapp.feature.exams.reportcard.ReportCardPanel
import com.schoolapp.feature.exams.results.components.SubjectsTable

/** One student's result in the exam: overall figures, marks per subject and remarks (web StudentResultDrawer). */
@Composable
internal fun StudentResultSheet(result: StudentResult, examName: String, onDismiss: () -> Unit, modifier: Modifier = Modifier) {
    AppBottomSheet(title = result.name, onDismiss = onDismiss, modifier = modifier) {
        val caption = listOfNotNull(
            examName.takeIf { it.isNotBlank() },
            result.rollNo?.let { stringResource(R.string.exams_result_caption_roll, it) },
        ).joinToString(" · ")
        if (caption.isNotEmpty()) {
            Text(caption, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        Column {
            KeyValueRow(stringResource(R.string.exams_percentage), stringResource(R.string.exams_percent_value, formatMarks(result.percent)))
            KeyValueRow(
                stringResource(R.string.exams_total),
                stringResource(R.string.exams_marks_of_max, formatMarks(result.totalMarks), formatMarks(result.maxTotal)),
            )
            KeyValueRow(stringResource(R.string.exams_grade), result.grade)
            KeyValueRow(stringResource(R.string.exams_position), result.position?.toString())
            KeyValueRow(stringResource(R.string.exams_result), stringResource(if (result.passed) R.string.exams_pass else R.string.exams_fail))
        }
        SubjectsTable(result.subjects)
        SectionHeader(title = stringResource(R.string.exams_remarks))
        Column {
            KeyValueRow(stringResource(R.string.exams_result_remarks), result.remarks)
            KeyValueRow(stringResource(R.string.exams_teacher_remark), result.teacherRemark)
        }
        if (result.examId.isNotBlank()) {
            ReportCardPanel(
                studentId = result.studentId,
                examId = result.examId,
                title = stringResource(R.string.exams_report_card_title, result.name, examName.ifBlank { result.examName }),
            )
        }
    }
}
