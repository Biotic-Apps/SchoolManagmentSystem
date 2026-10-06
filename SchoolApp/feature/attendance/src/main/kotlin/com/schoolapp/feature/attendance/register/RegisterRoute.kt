package com.schoolapp.feature.attendance.register

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.navigation.HealthCardDestination
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.registerStatusLabel
import com.schoolapp.feature.attendance.components.tone
import com.schoolapp.feature.attendance.register.components.CorrectionSheet
import com.schoolapp.feature.attendance.register.components.HealthAlertSheet
import com.schoolapp.feature.attendance.register.components.RegisterBottomBar

@Composable
fun RegisterRoute(
    onBack: () -> Unit,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: RegisterViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel) {
        RegisterActions(
            onRetry = viewModel::load,
            onRowTap = viewModel::onRowTap,
            onStatusSelected = viewModel::onStatusSelected,
            onMarkAllPresent = viewModel::markAllPresent,
            onAlertClick = viewModel::onAlertClick,
            onShowServerRegister = viewModel::discardLocalMarks,
            onToggleCompare = viewModel::onToggleCompare,
            onDiscardMine = viewModel::discardLocalMarks,
        )
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title.ifBlank { stringResource(R.string.attendance_register_title) },
                subtitle = formatDate(state.date),
                navigationIcon = { BackButton(onBack) },
                actions = { if (!state.isLoading) StatusChip(registerStatusLabel(state.status), state.status.tone(), Modifier.padding(end = 16.dp)) },
            )
        },
        bottomBar = {
            if (!state.isLoading && state.register != null && !state.isReadOnly && state.entries.isNotEmpty()) {
                RegisterBottomBar(state.showSubmit, state.isHelper, state.busyAction, viewModel::saveDraft, viewModel::onSubmitClick)
            }
        },
    ) { padding ->
        RegisterScreen(state, actions, Modifier.padding(padding))
    }
    RegisterDialogs(state, viewModel, onOpen)
}

@Composable
private fun RegisterDialogs(state: RegisterUiState, viewModel: RegisterViewModel, onOpen: (Any) -> Unit) {
    if (state.confirmSubmit) {
        val counts = state.counts
        ConfirmDialog(
            title = stringResource(R.string.attendance_confirm_submit_title),
            message = stringResource(
                R.string.attendance_confirm_submit_message,
                counts.present, counts.absent, counts.late, counts.leave, counts.halfDay,
            ),
            confirmLabel = stringResource(R.string.attendance_submit),
            onConfirm = viewModel::onConfirmSubmit,
            onDismiss = viewModel::onDismissConfirm,
        )
    }
    state.alertSheet?.let { alert ->
        val name = state.register?.entries?.firstOrNull { it.studentId == alert.studentId }?.name.orEmpty()
        HealthAlertSheet(
            alert = alert,
            studentName = name,
            onOpenHealthCard = {
                viewModel.onDismissAlert()
                onOpen(HealthCardDestination(alert.studentId))
            },
            onDismiss = viewModel::onDismissAlert,
        )
    }
    state.correction?.let { editor ->
        CorrectionSheet(
            editor = editor,
            onStatusChange = viewModel::onCorrectionStatus,
            onReasonChange = viewModel::onCorrectionReason,
            onSubmit = viewModel::submitCorrection,
            onDismiss = viewModel::onDismissCorrection,
        )
    }
}
