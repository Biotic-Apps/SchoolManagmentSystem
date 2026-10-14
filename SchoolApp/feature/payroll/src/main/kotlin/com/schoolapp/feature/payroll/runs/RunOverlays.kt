package com.schoolapp.feature.payroll.runs

import androidx.compose.runtime.Composable
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.payroll.runs.breakdown.LineBreakdownSheet
import com.schoolapp.feature.payroll.runs.overview.RunConfirmDialog
import com.schoolapp.feature.payroll.runs.payment.RecordPaymentSheet

/** Confirm dialog, breakdown sheet and payment sheet of the payroll tab. */
@Composable
internal fun RunOverlays(state: MonthlyPayrollUiState, viewModel: MonthlyPayrollViewModel) {
    val run = state.run ?: return
    state.confirm?.let { RunConfirmDialog(it, viewModel.actions::confirm, viewModel.actions::dismissConfirm) }
    val external = rememberExternalActions()
    state.breakdown?.let { breakdown ->
        val line = state.line(breakdown.staffId) ?: return@let
        LineBreakdownSheet(
            line = line,
            month = run.month,
            currency = run.currency,
            approved = state.approved,
            state = breakdown,
            onDownload = external::open,
            onRetryPdf = { viewModel.breakdown.retryPdf() },
            onDismiss = viewModel.breakdown::dismiss,
        )
    }
    state.payment?.let { form ->
        val line = state.line(form.staffId) ?: return@let
        RecordPaymentSheet(
            line = line,
            form = form,
            issues = viewModel.payment.issues(),
            currency = run.currency,
            today = viewModel.payment.todayText(),
            callbacks = viewModel.payment.callbacks,
        )
    }
}
