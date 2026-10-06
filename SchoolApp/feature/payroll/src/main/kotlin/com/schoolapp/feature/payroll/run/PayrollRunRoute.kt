package com.schoolapp.feature.payroll.run

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.PayrollLineCard
import com.schoolapp.feature.payroll.components.RunCard
import com.schoolapp.feature.payroll.components.monthLabel

/** Run detail (FLAG_SECURE): totals card and every staff line. */
@Composable
internal fun PayrollRunRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: PayrollRunViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SecureWindowEffect(state.secure)
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.payroll_run_title),
                subtitle = state.run?.month?.let(::monthLabel),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        PayrollRunContent(state, onRetry = viewModel::retry, modifier = Modifier.padding(padding))
    }
}

@Composable
internal fun PayrollRunContent(state: PayrollRunUiState, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    val run = state.run
    when {
        state.isLoading && run == null -> LoadingState(modifier)
        run == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            item(key = "note") { InlineMessage(stringResource(R.string.payroll_web_note), StatusTone.Info) }
            if (state.isWaitingForApproval) {
                item(key = "waiting") { InlineMessage(stringResource(R.string.payroll_waiting_in_approvals), StatusTone.Info) }
            }
            item(key = "totals") { RunCard(run) }
            item(key = "lines_header") { SectionHeader(stringResource(R.string.payroll_staff_lines)) }
            if (run.lines.isEmpty()) {
                item(key = "lines_empty") {
                    Text(stringResource(R.string.payroll_no_lines), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
            items(run.lines, key = { "line_${it.staffId}" }) { line -> PayrollLineCard(line) }
        }
    }
}
