package com.schoolapp.feature.attendance.qr

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.attendance.QrScanDirection
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import kotlinx.coroutines.delay

/** Full-screen QR attendance: direction, scan button, last result and today's scans (refreshed every 10 s). */
@Composable
internal fun QrScanScreen(viewModel: QrScanViewModel, onDismiss: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val scan = rememberQrScanner(onCode = viewModel::onScanned, onFailure = viewModel::onScannerFailed)
    LaunchedEffect(Unit) {
        while (true) {
            viewModel.refreshLogs()
            delay(LOG_REFRESH_MS)
        }
    }
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)) {
        AppScaffold(
            topBar = {
                AppTopBar(
                    title = stringResource(R.string.qr_title),
                    subtitle = stringResource(R.string.qr_subtitle),
                    navigationIcon = {
                        IconButton(onClick = onDismiss) { Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.leave_form_close)) }
                    },
                )
            },
        ) { padding ->
            ScreenColumn(Modifier.padding(padding)) {
                item(key = "direction") {
                    SegmentedChoice(
                        labels = listOf(stringResource(R.string.qr_check_in), stringResource(R.string.qr_check_out)),
                        selectedIndex = state.direction.ordinal,
                        onSelect = { viewModel.onDirection(QrScanDirection.entries[it]) },
                    )
                }
                item(key = "hero") { QrScanHero(state, onScan = scan) }
                state.problem?.let { problem ->
                    item(key = "problem") {
                        val text = if (problem == QrScanProblem.INVALID_CODE) R.string.qr_invalid_code else R.string.qr_scanner_unavailable
                        InlineMessage(stringResource(text), StatusTone.Error)
                    }
                }
                state.error?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                state.lastResult?.let { result -> item(key = "result") { QrResultCard(result) } }
                item(key = "recent_header") { SectionHeader(title = stringResource(R.string.qr_recent)) }
                item(key = "recent") { QrRecentScans(state) }
            }
        }
    }
}

private const val LOG_REFRESH_MS = 10_000L
