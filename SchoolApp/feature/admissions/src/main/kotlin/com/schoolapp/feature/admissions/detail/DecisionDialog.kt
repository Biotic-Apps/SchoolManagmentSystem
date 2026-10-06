package com.schoolapp.feature.admissions.detail

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.feature.admissions.R

@Composable
internal fun DecisionDialog(
    decision: AdmissionDecision,
    reason: String,
    reasonMissing: Boolean,
    busy: Boolean,
    onReasonChange: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AppColors.Surface,
        shape = MaterialTheme.shapes.medium,
        title = { Text(stringResource(decision.titleRes()), style = MaterialTheme.typography.titleLarge) },
        text = {
            AppTextArea(
                value = reason,
                onValueChange = onReasonChange,
                label = stringResource(R.string.admissions_reason),
                enabled = !busy,
                errorText = if (reasonMissing) stringResource(R.string.admissions_reason_required) else null,
            )
        },
        confirmButton = {
            AppTextButton(
                text = stringResource(decision.labelRes()),
                onClick = onConfirm,
                loading = busy,
                contentColor = if (decision == AdmissionDecision.REJECT) AppColors.Error else AppColors.Primary,
            )
        },
        dismissButton = {
            AppTextButton(text = stringResource(android.R.string.cancel), onClick = onDismiss, enabled = !busy, contentColor = AppColors.TextSecondary)
        },
    )
}

internal fun AdmissionDecision.labelRes(): Int = when (this) {
    AdmissionDecision.OFFER -> R.string.admissions_offer
    AdmissionDecision.WAITLIST -> R.string.admissions_waitlist
    AdmissionDecision.REJECT -> R.string.admissions_reject
}

private fun AdmissionDecision.titleRes(): Int = when (this) {
    AdmissionDecision.OFFER -> R.string.admissions_confirm_title_offer
    AdmissionDecision.WAITLIST -> R.string.admissions_confirm_title_waitlist
    AdmissionDecision.REJECT -> R.string.admissions_confirm_title_reject
}
