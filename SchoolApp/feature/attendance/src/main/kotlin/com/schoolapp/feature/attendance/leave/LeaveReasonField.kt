package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.feature.attendance.R

/** Reason with a live "n / max" counter; an error replaces the counter while shown. */
@Composable
internal fun LeaveReasonField(form: LeaveForm, onReasonChange: (String) -> Unit, enabled: Boolean, modifier: Modifier = Modifier) {
    val error = when {
        form.reasonMissing -> stringResource(R.string.attendance_leave_reason_required)
        form.reasonTooShort -> stringResource(R.string.leave_form_reason_short, LeaveForm.REASON_MIN)
        else -> null
    }
    AppTextArea(
        value = form.reason,
        onValueChange = onReasonChange,
        label = stringResource(R.string.leave_form_reason_hint),
        modifier = modifier,
        errorText = error,
        supportingText = stringResource(R.string.leave_form_reason_counter, form.reason.length, LeaveForm.REASON_MAX),
        enabled = enabled,
        minLines = 4,
        maxLines = 8,
    )
}
