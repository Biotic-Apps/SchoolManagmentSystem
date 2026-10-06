package com.schoolapp.feature.exams.results.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks
import com.schoolapp.feature.exams.results.ReportCardUi

/** One published exam result: overall figures, subjects table, remarks and the report card button. */
@Composable
internal fun ResultCard(
    result: StudentResult,
    reportCard: ReportCardUi?,
    onReportCard: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(result.examName, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                    formatDate(result.publishedAt)?.let {
                        Text(stringResource(R.string.exams_published_on, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                }
                Spacer(Modifier.width(8.dp))
                StatusChip(
                    stringResource(if (result.passed) R.string.exams_pass else R.string.exams_fail),
                    if (result.passed) StatusTone.Success else StatusTone.Error,
                )
            }
            KeyValueRow(stringResource(R.string.exams_overall), stringResource(R.string.exams_percent_value, formatMarks(result.percent)))
            KeyValueRow(
                stringResource(R.string.exams_total),
                stringResource(R.string.exams_marks_of_max, formatMarks(result.totalMarks), formatMarks(result.maxTotal)),
            )
            result.grade?.let { KeyValueRow(stringResource(R.string.exams_grade), it) }
            result.position?.let { KeyValueRow(stringResource(R.string.exams_position), it.toString()) }
            SubjectsTable(result.subjects)
            result.remarks?.let { KeyValueRow(stringResource(R.string.exams_remarks), it) }
            result.teacherRemark?.let { KeyValueRow(stringResource(R.string.exams_teacher_remark), it) }
            ReportCardAction(reportCard, onReportCard)
        }
    }
}

@Composable
private fun ReportCardAction(reportCard: ReportCardUi?, onReportCard: () -> Unit) {
    SecondaryButton(
        text = stringResource(R.string.exams_report_card),
        onClick = onReportCard,
        loading = reportCard?.loading == true,
        enabled = reportCard?.loading != true,
        leadingIcon = Icons.Outlined.Description,
    )
    reportCard?.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
    when (reportCard?.status) {
        ReportCardStatus.PENDING -> InlineMessage(stringResource(R.string.exams_report_card_pending), StatusTone.Info)
        ReportCardStatus.FAILED -> InlineMessage(stringResource(R.string.exams_report_card_failed), StatusTone.Error)
        ReportCardStatus.READY, null -> Unit
    }
}
