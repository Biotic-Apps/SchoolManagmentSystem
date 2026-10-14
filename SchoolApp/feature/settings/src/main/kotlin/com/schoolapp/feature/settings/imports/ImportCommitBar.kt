package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Upload
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** Upload a corrected file / Commit valid rows only / Commit n rows, each confirmed first. */
@Composable
internal fun ImportCommitBar(state: ImportFlowUiState, vm: ImportFlowViewModel, onUploadAgain: () -> Unit) {
    if (!state.canCommitAll && !state.canCommitValid && !state.needsNewFile) return
    val valid = state.totals.valid
    val invalid = state.totals.invalid
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.canCommitAll) {
            PrimaryButton(
                text = stringResource(R.string.settings_imports_commit_rows, rows(valid)),
                onClick = { vm.askCommit(CommitMode.ALL) },
                leadingIcon = Icons.Outlined.Check,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (state.canCommitValid) {
            SecondaryButton(
                text = stringResource(R.string.settings_imports_commit_valid_only),
                onClick = { vm.askCommit(CommitMode.SKIP) },
                contentColor = AppColors.Error,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (state.canCommitValid || state.needsNewFile) {
            SecondaryButton(
                text = stringResource(R.string.settings_imports_upload_corrected),
                onClick = onUploadAgain,
                loading = state.uploading,
                leadingIcon = Icons.Outlined.Upload,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
    when (state.commitDialog) {
        CommitMode.ALL -> ConfirmDialog(
            title = stringResource(R.string.settings_imports_commit_all_title, rows(valid)),
            message = stringResource(R.string.settings_imports_commit_all_message, rows(valid)),
            confirmLabel = stringResource(R.string.settings_imports_commit),
            onConfirm = vm::confirmCommit,
            onDismiss = vm::dismissCommit,
        )
        CommitMode.SKIP -> ConfirmDialog(
            title = stringResource(R.string.settings_imports_commit_skip_title),
            message = stringResource(R.string.settings_imports_commit_skip_message, rows(invalid), rows(valid)),
            confirmLabel = stringResource(R.string.settings_imports_commit_rows, rows(valid)),
            onConfirm = vm::confirmCommit,
            onDismiss = vm::dismissCommit,
            destructive = true,
        )
        null -> Unit
    }
}

@Composable
private fun rows(count: Int): String = pluralStringResource(R.plurals.settings_imports_rows_count, count, formatCount(count))
