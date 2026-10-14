package com.schoolapp.feature.reports.catalog

import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.reports.R
import com.schoolapp.feature.reports.components.RecentExportActions
import com.schoolapp.feature.reports.form.ReportFormSheet

@Composable
internal fun ReportsRoute(modifier: Modifier = Modifier, viewModel: ReportsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val context = LocalContext.current
    var confirmClear by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(state.openUrl) {
        state.openUrl?.let { url ->
            external.open(url)
            viewModel.onUrlOpened()
        }
    }
    val queuedText = stringResource(R.string.reports_queued)
    val retryText = stringResource(R.string.reports_retry_queued)
    LaunchedEffect(state.message) {
        val text = when (state.message) {
            ReportsMessage.QUEUED -> queuedText
            ReportsMessage.RETRY_QUEUED -> retryText
            null -> null
        }
        if (text != null) {
            Toast.makeText(context, text, Toast.LENGTH_SHORT).show()
            viewModel.onMessageShown()
        }
    }

    val actions = remember(viewModel) {
        RecentExportActions(
            onDownload = viewModel::download,
            onRetry = viewModel::retryExport,
            onCheckAgain = viewModel::checkAgain,
            onRemove = viewModel::remove,
        )
    }
    ReportsScreen(
        state = state,
        callbacks = ReportsCallbacks(
            onRetry = viewModel::retry,
            onRefresh = viewModel::refresh,
            onSelect = viewModel::select,
            onClearRecent = { confirmClear = true },
            onDismissError = viewModel::dismissActionError,
            recent = actions,
        ),
        modifier = modifier,
    )

    state.selected?.let { report ->
        ReportFormSheet(report = report, onDismiss = { viewModel.closeForm() }, onQueued = { viewModel.closeForm(queued = true) })
    }
    if (confirmClear) {
        ConfirmDialog(
            title = stringResource(R.string.reports_clear_confirm_title),
            message = stringResource(R.string.reports_clear_confirm_message),
            confirmLabel = stringResource(R.string.reports_recent_clear),
            onConfirm = {
                viewModel.clearRecent()
                confirmClear = false
            },
            onDismiss = { confirmClear = false },
        )
    }
}
