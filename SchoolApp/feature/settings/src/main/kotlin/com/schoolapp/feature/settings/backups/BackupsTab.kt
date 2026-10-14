package com.schoolapp.feature.settings.backups

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Backup
import androidx.compose.material.icons.outlined.Storage
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.settings.R

/** Settings › Backups (super admin): run a backup, restore-check it, download it and read the check results. */
@Composable
internal fun BackupsTab(modifier: Modifier = Modifier, viewModel: BackupsViewModel = hiltViewModel(key = "backups")) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(state.downloadUrl) {
        state.downloadUrl?.let {
            external.open(it)
            viewModel.downloadOpened()
        }
    }
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.runs.isEmpty() ->
            ErrorState(loadErrorMessage(state.error!!), modifier, onRetry = viewModel::retry)
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
            ScreenColumn {
                item(key = "header") { BackupsHeader(state, viewModel::askRun) }
                item(key = "notices") { BackupNotices(state) }
                state.actionError?.let { error -> item(key = "action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                if (state.runs.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.settings_backups_empty),
                            message = stringResource(R.string.settings_backups_empty_message),
                            icon = Icons.Outlined.Storage,
                        )
                    }
                }
                items(state.runs, key = { "backup_${it.id}" }) { run ->
                    BackupCard(
                        run = run,
                        verifying = state.verifyingId == run.id,
                        downloading = state.downloadingId == run.id,
                        onVerify = { viewModel.verify(run.id) },
                        onDownload = { viewModel.download(run.id) },
                        onViewChecks = { viewModel.showChecks(run.id) },
                    )
                }
            }
        }
    }
    if (state.confirmRun) {
        ConfirmDialog(
            title = stringResource(R.string.settings_backups_confirm_title),
            message = stringResource(R.string.settings_backups_confirm_message),
            confirmLabel = stringResource(R.string.settings_backups_run),
            onConfirm = viewModel::runBackup,
            onDismiss = viewModel::dismissRun,
        )
    }
    state.checksRun?.let { run -> BackupChecksSheet(run, onDismiss = { viewModel.showChecks(null) }) }
}

@Composable
private fun BackupsHeader(state: BackupsUiState, onRun: () -> Unit) = Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    SectionHeader(
        title = stringResource(R.string.settings_backups_title),
        subtitle = stringResource(R.string.settings_backups_retention),
    )
    PrimaryButton(
        text = stringResource(R.string.settings_backups_run),
        onClick = onRun,
        enabled = !state.backupRunning,
        loading = state.starting,
        leadingIcon = Icons.Outlined.Backup,
    )
}

@Composable
private fun BackupNotices(state: BackupsUiState) = Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    when {
        state.backupRunning -> InlineMessage(stringResource(R.string.settings_backups_running), StatusTone.Info)
        state.message == BackupMessage.BACKUP_STARTED -> InlineMessage(stringResource(R.string.settings_backups_finished), StatusTone.Success)
    }
    when {
        state.verifyRunning -> InlineMessage(stringResource(R.string.settings_backups_verifying), StatusTone.Info)
        state.message == BackupMessage.VERIFY_STARTED -> InlineMessage(stringResource(R.string.settings_backups_verify_done), StatusTone.Success)
    }
}
