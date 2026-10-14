package com.schoolapp.feature.homework.submissions

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.core.model.homework.SubmissionStatus
import com.schoolapp.core.ui.attachments.AttachmentLinks
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.components.GradeSummary
import com.schoolapp.feature.homework.components.SubmissionStatusChip

/** One student's submission; Grade / Return only for fresh (SUBMITTED / LATE) work and with `homework.edit`. */
@Composable
internal fun SubmissionCard(
    submission: HomeworkSubmission,
    maxMarks: Int?,
    canReview: Boolean,
    onGrade: () -> Unit,
    onReturn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier.fillMaxWidth(), verticalSpacing = 10.dp) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f)) {
                Text(
                    submission.student?.name.orEmpty(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextPrimary,
                )
                formatTimestamp(submission.submittedAt)?.let {
                    Text(stringResource(R.string.homework_submitted_at, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            SubmissionStatusChip(submission.status)
        }
        submission.text?.takeIf { it.isNotBlank() }?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        AttachmentLinks(submission.attachments)
        if (submission.status == SubmissionStatus.GRADED) GradeSummary(submission, maxMarks)
        if (canReview && submission.isReviewable) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                PrimaryButton(
                    text = stringResource(R.string.homework_grade_button),
                    onClick = onGrade,
                    leadingIcon = Icons.Outlined.CheckCircle,
                    modifier = Modifier.weight(1f),
                )
                SecondaryButton(
                    text = stringResource(R.string.homework_return_button),
                    onClick = onReturn,
                    leadingIcon = Icons.Outlined.Replay,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}
