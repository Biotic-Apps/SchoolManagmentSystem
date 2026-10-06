package com.schoolapp.feature.exams.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.exams.R

/** One mark sheet: title, status, paper date, completeness and the reviewer's comment when returned. */
@Composable
internal fun MarkSheetCard(
    sheet: MarkSheet,
    title: String,
    onClick: (() -> Unit)?,
    modifier: Modifier = Modifier,
    showTeacher: Boolean = false,
) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 0.dp) {
        Column(Modifier.padding(start = 16.dp, top = 16.dp, end = 16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Text(title, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                StatusChip(markSheetStatusLabel(sheet.status), sheet.status.tone())
            }
            formatDate(sheet.paperDate)?.let { Detail(stringResource(R.string.exams_paper_date, it)) }
            if (showTeacher) {
                Detail(sheet.teacher?.name?.let { stringResource(R.string.exams_teacher_name, it) } ?: stringResource(R.string.exams_teacher_unassigned))
            }
        }
        val complete = sheet.total > 0 && sheet.entered >= sheet.total
        ProgressRow(
            title = stringResource(R.string.exams_entered_of_total, sheet.entered, sheet.total),
            percent = percentOf(sheet.entered, sheet.total),
            tone = if (complete) StatusTone.Success else StatusTone.Warning,
        )
        val comment = sheet.comment?.takeIf { sheet.status == MarkSheetStatus.RETURNED && it.isNotBlank() }
        if (comment != null) {
            InlineMessage(
                stringResource(R.string.exams_returned_comment, comment),
                StatusTone.Error,
                Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
            )
        }
    }
}

@Composable
private fun Detail(text: String) {
    Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
}
