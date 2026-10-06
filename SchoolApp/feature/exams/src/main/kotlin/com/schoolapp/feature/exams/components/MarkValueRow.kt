package com.schoolapp.feature.exams.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.TabularNumbers
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.exams.R

/** Read-only student row: "marks / max" right aligned, or an Absent / Pending chip (pending is never 0). */
@Composable
internal fun MarkValueRow(
    rollNo: Int?,
    name: String,
    marks: Double?,
    absent: Boolean,
    maxMarks: Double,
    modifier: Modifier = Modifier,
) {
    val pending = marks == null && !absent
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = if (pending) AppColors.WarningContainer else AppColors.Surface,
        border = BorderStroke(1.dp, if (pending) AppColors.Warning else AppColors.Border),
    ) {
        Row(Modifier.padding(horizontal = 12.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(studentLabel(rollNo, name), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            Spacer(Modifier.width(12.dp))
            when {
                absent -> StatusChip(stringResource(R.string.exams_absent), StatusTone.Neutral)
                marks == null -> StatusChip(stringResource(R.string.exams_pending), StatusTone.Warning)
                else -> Text(
                    stringResource(R.string.exams_marks_of_max, formatMarks(marks), formatMarks(maxMarks)),
                    style = MaterialTheme.typography.bodyLarge.copy(fontFeatureSettings = TabularNumbers),
                    color = AppColors.TextPrimary,
                    textAlign = TextAlign.End,
                )
            }
        }
    }
}

/** "12. Ayesha Khan", or just the name when the roll number is unknown. */
@Composable
internal fun studentLabel(rollNo: Int?, name: String): String =
    rollNo?.let { stringResource(R.string.exams_roll_name, it, name) } ?: name
