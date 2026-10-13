package com.schoolapp.feature.exams.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.exams.R

/** Paper facts (max/pass marks, date, teacher) and live entered/absent/pending counts. */
@Composable
internal fun SheetHeader(
    sheet: MarkSheet,
    entered: Int,
    absent: Int,
    pending: Int,
    modifier: Modifier = Modifier,
    showTeacher: Boolean = false,
) {
    AppCard(modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            sheet.examName?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.exams_exam), it) }
            KeyValueRow(stringResource(R.string.exams_max_marks), formatMarks(sheet.maxMarks))
            KeyValueRow(stringResource(R.string.exams_pass_marks), sheet.passMarks?.let(::formatMarks))
            formatDate(sheet.paperDate)?.let { KeyValueRow(stringResource(R.string.exams_paper_date_label), it) }
            if (showTeacher) KeyValueRow(stringResource(R.string.exams_teacher), sheet.teacher?.name)
            Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                CountTile(stringResource(R.string.exams_count_entered), entered, StatusTone.Success, Modifier.weight(1f))
                CountTile(stringResource(R.string.exams_count_absent), absent, StatusTone.Neutral, Modifier.weight(1f))
                CountTile(stringResource(R.string.exams_count_pending), pending, StatusTone.Warning, Modifier.weight(1f))
            }
        }
    }
}
