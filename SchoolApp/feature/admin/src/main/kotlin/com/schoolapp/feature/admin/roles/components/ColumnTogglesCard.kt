package com.schoolapp.feature.admin.roles.components

import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.triStateToggleable
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TriStateCheckbox
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.MatrixAction
import com.schoolapp.feature.admin.roles.MatrixRow
import com.schoolapp.feature.admin.roles.columnKeys
import com.schoolapp.feature.admin.roles.selectionState

/** The web matrix column headers: tick one to grant (or clear) that action on every listed module. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ColumnTogglesCard(
    rows: List<MatrixRow>,
    selected: Set<String>,
    readOnly: Boolean,
    onToggleColumn: (MatrixAction, Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    val actions = MatrixAction.entries.filter { action -> columnKeys(rows, action).isNotEmpty() }
    if (actions.isEmpty()) return
    AppCard(modifier, contentPadding = 12.dp, verticalSpacing = 4.dp) {
        Text(stringResource(R.string.roles_columns_title), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        Text(stringResource(R.string.roles_columns_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        FlowRow {
            actions.forEach { action ->
                val state = selectionState(selected, columnKeys(rows, action))
                Row(
                    Modifier
                        .triStateToggleable(state = state, enabled = !readOnly, role = Role.Checkbox) {
                            onToggleColumn(action, state != ToggleableState.On)
                        }
                        .padding(end = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TriStateCheckbox(state = state, onClick = null, enabled = !readOnly, colors = roleCheckboxColors(), modifier = Modifier.padding(12.dp))
                    Text(stringResource(action.labelRes()), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                }
            }
        }
    }
}
