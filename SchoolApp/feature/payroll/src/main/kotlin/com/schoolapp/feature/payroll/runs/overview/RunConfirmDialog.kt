package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.runs.RunConfirm

/** Confirmation before sending the run for approval or closing it. */
@Composable
internal fun RunConfirmDialog(confirm: RunConfirm, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    when (confirm) {
        RunConfirm.APPROVE -> ConfirmDialog(
            title = stringResource(R.string.payroll_confirm_send_title),
            message = stringResource(R.string.payroll_confirm_send_message),
            confirmLabel = stringResource(R.string.payroll_send_for_approval),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
        )
        RunConfirm.CLOSE -> ConfirmDialog(
            title = stringResource(R.string.payroll_confirm_close_title),
            message = stringResource(R.string.payroll_confirm_close_message),
            confirmLabel = stringResource(R.string.payroll_action_close),
            onConfirm = onConfirm,
            onDismiss = onDismiss,
            destructive = true,
        )
    }
}
