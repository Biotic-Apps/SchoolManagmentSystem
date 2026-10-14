package com.schoolapp.feature.admin.roles.editor

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.MatrixAction
import com.schoolapp.feature.admin.roles.MatrixRow
import com.schoolapp.feature.admin.roles.components.ColumnTogglesCard
import com.schoolapp.feature.admin.roles.components.PermissionModuleCard
import com.schoolapp.feature.admin.roles.components.SpecialPermissionsCard

internal class RoleEditorCallbacks(
    val onNameChange: (String) -> Unit,
    val onSchoolChange: (String) -> Unit,
    val onModuleQueryChange: (String) -> Unit,
    val onToggle: (String, Boolean) -> Unit,
    val onToggleRow: (MatrixRow, Boolean) -> Unit,
    val onToggleColumn: (MatrixAction, Boolean) -> Unit,
    val onSave: () -> Unit,
)

@Composable
internal fun RoleEditorContent(state: RoleEditorUiState, callbacks: RoleEditorCallbacks, modifier: Modifier = Modifier) {
    val readOnly = !state.rights.permissions
    val selected = state.selectedSet
    ScreenColumn(modifier, itemSpacing = 12.dp) {
        state.notice?.let { notice -> item(key = "notice") { InlineMessage(stringResource(notice), StatusTone.Info) } }
        item(key = "details") { RoleDetailsCard(state, callbacks.onNameChange, callbacks.onSchoolChange) }
        item(key = "perm-header") {
            SectionHeader(
                title = stringResource(R.string.roles_permissions_title),
                subtitle = stringResource(R.string.roles_selected_count, state.selected.size, state.total),
            )
        }
        if (state.permissionsError) {
            item(key = "perm-error") { InlineMessage(stringResource(R.string.roles_permissions_required), StatusTone.Error) }
        }
        item(key = "module-search") {
            SearchField(state.moduleQuery, callbacks.onModuleQueryChange, placeholder = stringResource(R.string.roles_module_search_hint))
        }
        val rows = state.visibleRows
        if (!readOnly && rows.isNotEmpty()) {
            item(key = "columns") { ColumnTogglesCard(rows, selected, readOnly, callbacks.onToggleColumn, Modifier.fillMaxWidth()) }
        }
        if (rows.isEmpty()) {
            item(key = "no-modules") {
                Text(stringResource(R.string.roles_no_modules), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            }
        }
        rows.forEach { row ->
            item(key = "module-${row.module}") {
                PermissionModuleCard(
                    row = row,
                    selected = selected,
                    readOnly = readOnly,
                    onToggle = callbacks.onToggle,
                    onToggleRow = { on -> callbacks.onToggleRow(row, on) },
                )
            }
        }
        if (state.moduleQuery.isBlank()) {
            item(key = "specials") { SpecialPermissionsCard(state.matrix.specials, selected, readOnly, callbacks.onToggle) }
        }
        state.saveError?.let { error -> item(key = "save-error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
        item(key = "save") {
            val label = when {
                state.rights.readOnly -> R.string.roles_done
                state.role == null -> R.string.roles_create_submit
                else -> R.string.roles_save
            }
            PrimaryButton(stringResource(label), callbacks.onSave, Modifier.fillMaxWidth(), loading = state.isSaving)
        }
    }
}
