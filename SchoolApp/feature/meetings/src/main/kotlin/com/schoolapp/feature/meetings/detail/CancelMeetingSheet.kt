package com.schoolapp.feature.meetings.detail

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R

@Composable
internal fun CancelMeetingSheet(
    reason: String,
    busy: Boolean,
    error: AppError?,
    onReasonChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
    declining: Boolean = false,
) {
    val title = if (declining) R.string.meetings_decline_title else R.string.meetings_cancel_title
    AppBottomSheet(title = stringResource(title), onDismiss = onDismiss) {
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(value = reason, onValueChange = onReasonChange, label = stringResource(R.string.meetings_cancel_reason), enabled = !busy)
        val submit = if (declining) R.string.meetings_confirm_decline else R.string.meetings_confirm_cancel
        PrimaryButton(stringResource(submit), onSubmit, loading = busy)
    }
}
