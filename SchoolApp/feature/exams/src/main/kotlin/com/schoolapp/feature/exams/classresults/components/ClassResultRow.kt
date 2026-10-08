package com.schoolapp.feature.exams.classresults.components

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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.TabularNumbers
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks

/** Roll + name, total / % / grade, position and pass/fail; tap opens subject marks. */
@Composable
internal fun ClassResultRow(result: StudentResult, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = result.rollNo?.let { stringResource(R.string.exams_roll_name, it, result.name) } ?: result.name,
                    style = MaterialTheme.typography.titleSmall,
                    color = AppColors.TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = stringResource(
                        R.string.exams_result_summary,
                        formatMarks(result.totalMarks),
                        formatMarks(result.maxTotal),
                        formatMarks(result.percent),
                        result.grade ?: "-",
                    ),
                    style = MaterialTheme.typography.bodySmall.copy(fontFeatureSettings = TabularNumbers),
                    color = AppColors.TextSecondary,
                )
                result.position?.let {
                    Text(stringResource(R.string.exams_result_position, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            Spacer(Modifier.width(8.dp))
            PassChip(result.passed)
        }
    }
}

@Composable
internal fun PassChip(passed: Boolean, modifier: Modifier = Modifier) {
    StatusChip(
        stringResource(if (passed) R.string.exams_pass else R.string.exams_fail),
        if (passed) StatusTone.Success else StatusTone.Error,
        modifier,
    )
}
