package com.schoolapp.feature.payroll.runs

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.MonthHeader
import com.schoolapp.feature.payroll.components.designationLabel
import com.schoolapp.feature.payroll.components.label
import com.schoolapp.feature.payroll.components.rememberPdfOpener
import com.schoolapp.feature.payroll.runs.overview.CreateRunEmpty
import com.schoolapp.feature.payroll.runs.overview.RunNoticeBanner
import com.schoolapp.feature.payroll.runs.overview.RunOverviewCard
import com.schoolapp.feature.payroll.runs.overview.RunTotalsRow

/** "Monthly payroll" tab: month stepper, the month's run (or create it), workflow actions and staff lines. */
@Composable
internal fun MonthlyPayrollTab(
    branch: FinanceBranch,
    session: SessionContext,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    val viewModel: MonthlyPayrollViewModel = hiltViewModel(key = "payroll_runs_${branch.id}")
    LaunchedEffect(branch.id, session) { viewModel.bind(branch.id, session) }
    MonthlyPayrollContent(viewModel, onOpenApprovals, modifier)
}

/** Shared by the tab and the run screen opened from a link. */
@Composable
internal fun MonthlyPayrollContent(viewModel: MonthlyPayrollViewModel, onOpenApprovals: (() -> Unit)?, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val pdfOpener = rememberPdfOpener()
    LaunchedEffect(state.pdfToOpen) {
        state.pdfToOpen?.let {
            pdfOpener.open(it)
            viewModel.actions.onPdfOpened()
        }
    }
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn {
            if (!state.fixedRun) {
                item(key = "month") { MonthHeader(state.month, state.canGoNext, viewModel::onPreviousMonth, viewModel::onNextMonth) }
            }
            state.notice?.let { item(key = "notice") { RunNoticeBanner(it) } }
            state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            val run = state.run
            val error = state.error
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                error != null -> item(key = "error") { ErrorState(appErrorMessage(error), onRetry = viewModel::retry) }
                run == null -> item(key = "create") {
                    CreateRunEmpty(state.month.label(), state.permissions.canAdd, state.creating, viewModel::createRun)
                }
                else -> runItems(state, run, viewModel, onOpenApprovals)
            }
        }
    }
    RunOverlays(state, viewModel)
}

private fun androidx.compose.foundation.lazy.LazyListScope.runItems(
    state: MonthlyPayrollUiState,
    run: com.schoolapp.core.model.payroll.PayrollRun,
    viewModel: MonthlyPayrollViewModel,
    onOpenApprovals: (() -> Unit)?,
) {
    item(key = "overview") { RunOverviewCard(run, state, viewModel.actions.callbacks, onOpenApprovals) }
    if (state.staffTypes.size > 1) {
        item(key = "types") {
            val options = listOf(SwitcherOption(ALL, stringResource(R.string.payroll_all_staff_types))) +
                state.staffTypes.map { SwitcherOption(it, designationLabel(it) ?: it) }
            FilterChipRow(options, state.staffType ?: ALL, { viewModel.onStaffType(it.takeIf { id -> id != ALL }) })
        }
    }
    item(key = "totals") { RunTotalsRow(state.totals, state.lines.size, run.currency) }
    item(key = "lines_header") { SectionHeader(stringResource(R.string.payroll_staff_lines)) }
    if (state.lines.isEmpty()) {
        item(key = "lines_empty") {
            EmptyState(
                title = stringResource(R.string.payroll_lines_empty),
                message = stringResource(R.string.payroll_lines_empty_message),
                icon = Icons.Outlined.Groups,
            )
        }
    }
    items(state.lines, key = { "line_${it.staffId}" }) { line ->
        RunLineCard(
            line = line,
            currency = run.currency,
            canPay = state.canPay(line),
            onBreakdown = { viewModel.breakdown.open(line.staffId) },
            onPay = { viewModel.payment.open(line.staffId) },
        )
    }
}

private const val ALL = "ALL"
