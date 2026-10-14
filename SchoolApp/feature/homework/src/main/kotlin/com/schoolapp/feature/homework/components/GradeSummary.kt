package com.schoolapp.feature.homework.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.feature.homework.R

/** Marks / grade / feedback box of a graded submission. */
@Composable
internal fun GradeSummary(submission: HomeworkSubmission, maxMarks: Int?, modifier: Modifier = Modifier) {
    Column(
        modifier
            .fillMaxWidth()
            .background(AppColors.Background, MaterialTheme.shapes.small)
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        submission.marks?.let { marks ->
            val value = if (maxMarks != null) stringResource(R.string.homework_marks_of, marks, maxMarks) else marks.toString()
            KeyValueRow(stringResource(R.string.homework_marks), value)
        }
        submission.grade?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.homework_grade), it) }
        submission.feedback?.takeIf { it.isNotBlank() }?.let { feedback ->
            Text(
                feedback,
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                modifier = Modifier.padding(vertical = 6.dp),
            )
        }
    }
}
