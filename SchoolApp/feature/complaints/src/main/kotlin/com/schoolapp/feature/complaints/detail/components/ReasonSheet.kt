package com.schoolapp.feature.complaints.detail.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.detail.ReasonAction
import com.schoolapp.feature.complaints.detail.ReasonEditor

/** Escalate / close / reopen with a reason; server errors (e.g. reopen window passed) show inline. */
@Composable
internal fun ReasonSheet(
    editor: ReasonEditor,
    onReasonChange: (String) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    val (titleRes, helpRes) = when (editor.action) {
        ReasonAction.ESCALATE -> R.string.complaints_escalate to R.string.complaints_escalate_help
        ReasonAction.CLOSE -> R.string.complaints_close to R.string.complaints_close_help
        ReasonAction.REOPEN -> R.string.complaints_reopen to R.string.complaints_reopen_help
    }
    AppBottomSheet(title = stringResource(titleRes), onDismiss = onDismiss) {
        Text(stringResource(helpRes), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(
            value = editor.reason,
            onValueChange = onReasonChange,
            label = stringResource(if (editor.reasonRequired) R.string.complaints_reason else R.string.complaints_reason_optional),
            errorText = if (editor.reasonMissing) stringResource(R.string.complaints_required) else null,
            enabled = !editor.isSaving,
        )
        PrimaryButton(stringResource(titleRes), onSave, loading = editor.isSaving)
    }
}
