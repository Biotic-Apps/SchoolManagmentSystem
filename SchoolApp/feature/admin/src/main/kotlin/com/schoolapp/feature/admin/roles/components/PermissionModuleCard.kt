package com.schoolapp.feature.admin.roles.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.selection.triStateToggleable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TriStateCheckbox
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.MatrixAction
import com.schoolapp.feature.admin.roles.MatrixRow
import com.schoolapp.feature.admin.roles.selectionState

/** One module: a tri-state "all" checkbox, then one chip per action the module offers. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun PermissionModuleCard(
    row: MatrixRow,
    selected: Set<String>,
    readOnly: Boolean,
    onToggle: (String, Boolean) -> Unit,
    onToggleRow: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    val state = selectionState(selected, row.keys)
    val count = row.keys.count { it in selected }
    val allLabel = stringResource(R.string.roles_toggle_module, row.label)
    AppCard(modifier.fillMaxWidth(), contentPadding = 12.dp, verticalSpacing = 8.dp) {
        Row(
            Modifier
                .fillMaxWidth()
                .triStateToggleable(state = state, enabled = !readOnly, role = Role.Checkbox) { onToggleRow(state != ToggleableState.On) }
                .semantics { contentDescription = allLabel },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            TriStateCheckbox(state = state, onClick = null, enabled = !readOnly, colors = roleCheckboxColors())
            Text(row.label, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            Text(stringResource(R.string.roles_module_count, count, row.keys.size), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MatrixAction.entries.forEach { action ->
                val permission = row.cells[action] ?: return@forEach
                val on = permission.key in selected
                FilterChip(
                    selected = on,
                    onClick = { onToggle(permission.key, !on) },
                    enabled = !readOnly,
                    label = { Text(stringResource(action.labelRes())) },
                    leadingIcon = if (on) {
                        { Icon(Icons.Outlined.Check, contentDescription = null) }
                    } else {
                        null
                    },
                    modifier = Modifier.semantics { contentDescription = permission.description.ifBlank { permission.key } },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = AppColors.Surface,
                        labelColor = AppColors.TextPrimary,
                        selectedContainerColor = AppColors.Selected,
                        selectedLabelColor = AppColors.Primary,
                        selectedLeadingIconColor = AppColors.Primary,
                    ),
                )
            }
        }
    }
}
