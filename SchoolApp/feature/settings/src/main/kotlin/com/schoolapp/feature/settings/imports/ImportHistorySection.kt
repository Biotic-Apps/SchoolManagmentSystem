package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Undo
import androidx.compose.material.icons.outlined.History
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R

internal fun LazyListScope.importHistoryItems(state: ImportHistoryUiState, onOpen: (String) -> Unit, vm: ImportHistoryViewModel) {
    item(key = "hist_header") { SectionHeader(title = stringResource(R.string.settings_imports_history)) }
    if (state.reverted) item(key = "hist_reverted") { InlineMessage(stringResource(R.string.settings_imports_reverted), StatusTone.Success) }
    state.revertError?.let { error -> item(key = "hist_revert_error") { InlineMessage(revertMessage(error), StatusTone.Error) } }
    val rows = state.rows
    when {
        state.isLoading && rows == null -> item(key = "hist_loading") { LoadingState(rows = 2) }
        state.error != null && rows == null -> item(key = "hist_error") { ErrorState(loadErrorMessage(state.error), onRetry = vm::retry) }
        rows.isNullOrEmpty() -> item(key = "hist_empty") {
            EmptyState(
                title = stringResource(R.string.settings_imports_history_empty),
                message = stringResource(R.string.settings_imports_history_empty_message),
                icon = Icons.Outlined.History,
            )
        }
        else -> items(rows.orEmpty(), key = { "hist_${it.id}" }) { row ->
            HistoryCard(row, onOpen = { onOpen(row.id) }, onRevert = { vm.askRevert(row) })
        }
    }
}

@Composable
private fun HistoryCard(row: ImportSummary, onOpen: () -> Unit, onRevert: () -> Unit) {
    val dash = stringResource(R.string.settings_dash)
    AppCard(onClick = onOpen, verticalSpacing = 2.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(importKindLabel(row.kind), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            StatusChip(humanizeKey(row.status), importStatusTone(row.status))
        }
        Text(row.fileName ?: dash, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        KeyValueRow(stringResource(R.string.settings_imports_started), formatTimestamp(row.startedAt) ?: dash)
        row.totals?.let { totals ->
            KeyValueRow(
                stringResource(R.string.settings_imports_rows_summary_label),
                stringResource(R.string.settings_imports_rows_summary, formatCount(totals.rows), formatCount(totals.valid), formatCount(totals.invalid)),
            )
        }
        KeyValueRow(stringResource(R.string.settings_imports_by), row.startedBy ?: dash)
        if (row.status == ImportDetail.COMMITTED) {
            AppTextButton(
                text = stringResource(R.string.settings_imports_revert),
                onClick = onRevert,
                leadingIcon = Icons.AutoMirrored.Outlined.Undo,
                contentColor = AppColors.Error,
            )
        }
    }
}

@Composable
internal fun RevertDialog(state: ImportHistoryUiState, vm: ImportHistoryViewModel) {
    val target = state.revertTarget ?: return
    ConfirmDialog(
        title = stringResource(R.string.settings_imports_revert_title),
        message = stringResource(R.string.settings_imports_revert_message, importKindLabel(target.kind).lowercase()),
        confirmLabel = stringResource(R.string.settings_imports_revert_confirm),
        onConfirm = vm::confirmRevert,
        onDismiss = { vm.askRevert(null) },
        destructive = true,
    )
}

/** A 409 means the created records are already in use. */
@Composable
private fun revertMessage(error: AppError): String =
    if ((error as? AppError.Server)?.httpCode == CONFLICT) {
        error.message ?: stringResource(R.string.settings_imports_revert_in_use)
    } else {
        appErrorMessage(error)
    }

private const val CONFLICT = 409
