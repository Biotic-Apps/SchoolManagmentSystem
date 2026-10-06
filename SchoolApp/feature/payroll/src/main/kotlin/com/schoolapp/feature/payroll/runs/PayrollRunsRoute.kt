package com.schoolapp.feature.payroll.runs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.RunCard

@Composable
internal fun PayrollRunsRoute(
    onOpenRun: (String) -> Unit,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    viewModel: PayrollRunsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    PayrollRunsScreen(
        state = state,
        onOpenRun = onOpenRun,
        onSend = viewModel::sendForApproval,
        onOpenApprovals = onOpenApprovals,
        onRefresh = viewModel::refresh,
        onRetry = viewModel::retry,
        modifier = modifier,
    )
}

@Composable
internal fun PayrollRunsScreen(
    state: PayrollRunsUiState,
    onOpenRun: (String) -> Unit,
    onSend: (String) -> Unit,
    onOpenApprovals: (() -> Unit)?,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.runs.isEmpty() -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> RefreshBox(state.isRefreshing, onRefresh, modifier) {
            ScreenColumn {
                item(key = "note") { InlineMessage(stringResource(R.string.payroll_web_note), StatusTone.Info) }
                state.actionError?.let { error -> item(key = "action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                if (state.runs.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.payroll_runs_empty),
                            message = stringResource(R.string.payroll_runs_empty_message),
                            icon = Icons.AutoMirrored.Outlined.ReceiptLong,
                        )
                    }
                }
                items(state.runs, key = { "run_${it.id}" }) { run ->
                    RunCard(run = run, onClick = { onOpenRun(run.id) }) {
                        RunFooter(state, run, onSend, onOpenApprovals)
                    }
                }
            }
        }
    }
}

@Composable
private fun RunFooter(state: PayrollRunsUiState, run: PayrollRun, onSend: (String) -> Unit, onOpenApprovals: (() -> Unit)?) {
    val sent = state.sentRunId == run.id
    when {
        state.canSend(run) -> PrimaryButton(
            text = stringResource(R.string.payroll_send_for_approval),
            onClick = { onSend(run.id) },
            loading = state.sendingId == run.id,
            enabled = state.sendingId == null,
            leadingIcon = Icons.AutoMirrored.Outlined.Send,
        )
        sent || state.isWaiting(run) -> Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            InlineMessage(
                text = stringResource(if (sent) R.string.payroll_sent_to_approvals else R.string.payroll_waiting_in_approvals),
                tone = if (sent) StatusTone.Success else StatusTone.Info,
            )
            onOpenApprovals?.let { AppTextButton(stringResource(R.string.payroll_open_approvals), it) }
        }
    }
}
