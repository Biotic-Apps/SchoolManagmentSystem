package com.schoolapp.feature.homework.submit

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkSubmission
import com.schoolapp.core.model.homework.SubmissionStatus
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentLinks
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.components.GradeSummary
import com.schoolapp.feature.homework.components.SubmissionStatusChip
import com.schoolapp.feature.homework.components.UploadErrorMessage
import com.schoolapp.feature.homework.submit.SubmitHomeworkViewModel.Companion.MAX_FILES
import com.schoolapp.feature.homework.submit.SubmitHomeworkViewModel.Companion.TEXT_MAX

internal class SubmitHomeworkActions(
    val onText: (String) -> Unit,
    val onAttach: (String) -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun SubmitHomeworkContent(
    state: SubmitHomeworkUiState,
    homework: Homework,
    actions: SubmitHomeworkActions,
    modifier: Modifier = Modifier,
) {
    val submission = state.submission
    ScreenColumn(modifier) {
        item(key = "details") {
            AppCard(verticalSpacing = 10.dp) {
                Text(homework.description, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                AttachmentLinks(homework.attachments)
            }
        }
        if (submission != null) item(key = "submission") { OwnSubmissionCard(submission, homework.maxMarks) }
        if (submission?.status == SubmissionStatus.RETURNED) {
            item(key = "returned") {
                val text = listOfNotNull(stringResource(R.string.homework_returned_title), submission.feedback?.takeIf { it.isNotBlank() })
                InlineMessage(text.joinToString("\n"), StatusTone.Warning)
            }
        }
        if (!state.hasSubmitPermission) {
            item(key = "no_permission") { InlineMessage(stringResource(R.string.homework_no_submit_permission), StatusTone.Info) }
        }
        if (state.canSubmit) submitForm(state, resubmit = submission != null, actions)
    }
}

private fun LazyListScope.submitForm(state: SubmitHomeworkUiState, resubmit: Boolean, actions: SubmitHomeworkActions) {
    val enabled = !state.isSaving
    item(key = "answer") {
        AppTextArea(
            value = state.text,
            onValueChange = actions.onText,
            label = stringResource(R.string.homework_answer),
            enabled = enabled,
            minLines = 5,
            maxLines = 12,
            errorText = when {
                state.emptyError -> stringResource(R.string.homework_error_empty_submission)
                state.textTooLong -> stringResource(R.string.homework_error_too_long, TEXT_MAX)
                else -> null
            },
        )
    }
    item(key = "files") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AttachmentsField(
                draft = state.attachments,
                onPicked = actions.onAttach,
                onRemove = actions.onRemoveAttachment,
                label = stringResource(R.string.homework_attach_files),
                max = MAX_FILES,
                enabled = enabled,
            )
            state.uploadError?.let { UploadErrorMessage(it) }
        }
    }
    state.error?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
    item(key = "submit") {
        PrimaryButton(
            text = stringResource(if (resubmit) R.string.homework_resubmit else R.string.homework_submit),
            onClick = actions.onSubmit,
            loading = state.isSaving,
            enabled = !state.attachments.isUploading,
            leadingIcon = Icons.AutoMirrored.Outlined.Send,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun OwnSubmissionCard(submission: HomeworkSubmission, maxMarks: Int?) {
    AppCard(verticalSpacing = 10.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                stringResource(R.string.homework_your_submission),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            SubmissionStatusChip(submission.status)
        }
        submission.text?.takeIf { it.isNotBlank() }?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        AttachmentLinks(submission.attachments)
        if (submission.status == SubmissionStatus.GRADED) GradeSummary(submission, maxMarks)
    }
}
