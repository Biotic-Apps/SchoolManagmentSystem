package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ImportKind
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.OptionPickerField

/** Step 1: branch, academic session (defaults to the active one) and what to import. */
@Composable
internal fun ImportContextStep(state: ImportFlowUiState, vm: ImportFlowViewModel) {
    val disabled = state.uploading || state.busy
    when {
        state.branchesLoading -> LoadingState(rows = 2)
        state.branchesError != null -> ErrorState(loadErrorMessage(state.branchesError), onRetry = vm::retryBranches)
        state.branches.isEmpty() -> InlineMessage(stringResource(R.string.settings_imports_no_branch), StatusTone.Warning)
        else -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OptionPickerField(
                label = stringResource(R.string.settings_imports_branch),
                options = state.branches.map { SwitcherOption(it.id, it.name) },
                selectedId = state.branchId,
                onSelect = vm::selectBranch,
                enabled = !disabled,
            )
            if (state.sessionsLoading) {
                LoadingState(rows = 1)
            } else {
                OptionPickerField(
                    label = stringResource(R.string.settings_imports_session),
                    options = state.sessions.map { SwitcherOption(it.id, it.name) },
                    selectedId = state.sessionId,
                    onSelect = vm::selectSession,
                    enabled = !disabled,
                )
                if (state.sessions.isEmpty()) {
                    Text(
                        stringResource(R.string.settings_imports_no_session),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                    )
                }
            }
            Text(stringResource(R.string.settings_imports_what), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
            ImportKind.entries.forEach { kind ->
                AppCard(
                    onClick = { vm.selectKind(kind) },
                    selected = kind == state.kind,
                    enabled = !disabled,
                    contentPadding = 12.dp,
                ) {
                    Text(stringResource(kind.label), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                    Text(stringResource(kind.description), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}
