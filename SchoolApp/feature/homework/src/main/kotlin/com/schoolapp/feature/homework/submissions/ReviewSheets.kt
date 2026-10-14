package com.schoolapp.feature.homework.submissions

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.homework.R
import com.schoolapp.feature.homework.submissions.SubmissionsViewModel.Companion.FEEDBACK_MAX
import com.schoolapp.feature.homework.submissions.SubmissionsViewModel.Companion.GRADE_MAX
import com.schoolapp.feature.homework.submissions.SubmissionsViewModel.Companion.MARKS_MAX

internal class GradeSheetActions(
    val onMarks: (String) -> Unit,
    val onGrade: (String) -> Unit,
    val onFeedback: (String) -> Unit,
    val onSave: () -> Unit,
    val onDismiss: () -> Unit,
)

@Composable
internal fun GradeSheet(draft: GradeDraft, maxMarks: Int?, actions: GradeSheetActions) {
    val enabled = !draft.isSaving
    AppBottomSheet(
        title = stringResource(R.string.homework_grade_title, draft.submission.student?.name.orEmpty()),
        onDismiss = actions.onDismiss,
    ) {
        maxMarks?.let {
            Text(stringResource(R.string.homework_max_marks_hint, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        AppTextField(
            value = draft.marks,
            onValueChange = actions.onMarks,
            label = maxMarks?.let { stringResource(R.string.homework_marks_out_of, it) } ?: stringResource(R.string.homework_marks_label),
            enabled = enabled,
            kind = FieldKind.Number,
            errorText = if (draft.marksInvalid) stringResource(R.string.homework_error_marks_max, maxMarks ?: MARKS_MAX) else null,
        )
        AppTextField(
            value = draft.grade,
            onValueChange = actions.onGrade,
            label = stringResource(R.string.homework_grade_label),
            enabled = enabled,
            kind = FieldKind.Code,
            errorText = if (draft.gradeTooLong) stringResource(R.string.homework_error_too_long, GRADE_MAX) else null,
        )
        AppTextArea(
            value = draft.feedback,
            onValueChange = actions.onFeedback,
            label = stringResource(R.string.homework_feedback_label),
            enabled = enabled,
            errorText = if (draft.feedbackTooLong) stringResource(R.string.homework_error_too_long, FEEDBACK_MAX) else null,
        )
        draft.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.homework_save_grade),
            onClick = actions.onSave,
            loading = draft.isSaving,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
internal fun ReturnSheet(draft: ReturnDraft, onNote: (String) -> Unit, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    AppBottomSheet(title = stringResource(R.string.homework_return_title), onDismiss = onDismiss) {
        Text(
            stringResource(R.string.homework_return_message, draft.submission.student?.name.orEmpty()),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        AppTextArea(
            value = draft.note,
            onValueChange = onNote,
            label = stringResource(R.string.homework_return_note),
            enabled = !draft.isSaving,
            errorText = if (draft.noteMissing) stringResource(R.string.homework_error_note) else null,
        )
        draft.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.homework_return_button),
            onClick = onConfirm,
            loading = draft.isSaving,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
