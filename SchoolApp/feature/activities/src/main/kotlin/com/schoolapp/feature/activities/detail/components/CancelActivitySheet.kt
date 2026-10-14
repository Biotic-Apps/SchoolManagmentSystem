package com.schoolapp.feature.activities.detail.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.detail.LifecycleActions

/** Cancel needs a reason; it is shown on the activity to staff and parents. */
@Composable
internal fun CancelActivitySheet(
    actions: LifecycleActions,
    onReasonChange: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    if (!actions.cancelOpen) return
    val busy = actions.busyStatus == ActivityStatus.CANCELLED
    AppBottomSheet(title = stringResource(R.string.activities_cancel_title), onDismiss = { if (!busy) onDismiss() }) {
        Text(stringResource(R.string.activities_cancel_message), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        AppTextArea(
            value = actions.cancelReason,
            onValueChange = onReasonChange,
            label = stringResource(R.string.activities_cancel_reason),
            errorText = stringResource(R.string.activities_cancel_reason_required).takeIf { actions.cancelReasonMissing },
            enabled = !busy,
        )
        PrimaryButton(stringResource(R.string.activities_cancel_confirm), onConfirm, Modifier.fillMaxWidth(), loading = busy)
        SecondaryButton(stringResource(R.string.activities_keep_activity), onDismiss, Modifier.fillMaxWidth(), enabled = !busy)
    }
}
