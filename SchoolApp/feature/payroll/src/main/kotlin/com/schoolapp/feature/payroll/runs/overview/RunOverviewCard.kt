package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.monthLabel
import com.schoolapp.feature.payroll.components.payrollStatusLabel
import com.schoolapp.feature.payroll.components.payrollTone
import com.schoolapp.feature.payroll.runs.MonthlyPayrollUiState

/** Run header: title and status, workflow stepper, gated actions, calculation progress and warnings. */
@Composable
internal fun RunOverviewCard(
    run: PayrollRun,
    state: MonthlyPayrollUiState,
    callbacks: RunActionCallbacks,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        SectionHeader(
            title = stringResource(R.string.payroll_runs_for, monthLabel(run.month)),
            subtitle = run.branchName?.takeIf { it.isNotBlank() },
            action = { StatusChip(payrollStatusLabel(run.status.name), payrollTone(run.status.name)) },
        )
        RunStatusStepper(run.status)
        RunActionButtons(
            state = state,
            onCalculate = callbacks.onCalculate,
            onPrint = callbacks.onPrint,
            onReview = callbacks.onReview,
            onSend = callbacks.onSend,
            onClose = callbacks.onClose,
        )
        if (state.calculating) InlineMessage(stringResource(R.string.payroll_calculating), StatusTone.Info)
        if (state.awaitingApproval) {
            InlineMessage(stringResource(R.string.payroll_waiting_for_approval), StatusTone.Warning)
            onOpenApprovals?.let { AppTextButton(stringResource(R.string.payroll_open_approvals), it) }
        }
        if (run.pendingOvertimeCount > 0) {
            InlineMessage(
                pluralStringResource(R.plurals.payroll_pending_overtime, run.pendingOvertimeCount, run.pendingOvertimeCount),
                StatusTone.Warning,
            )
        }
        if (state.canClose && !state.closeEnabled) InlineMessage(stringResource(R.string.payroll_close_needs_paid), StatusTone.Info)
    }
}

/** Run action callbacks, wired to the view model by the tab. */
internal class RunActionCallbacks(
    val onCalculate: () -> Unit,
    val onPrint: () -> Unit,
    val onReview: () -> Unit,
    val onSend: () -> Unit,
    val onClose: () -> Unit,
)
