package com.schoolapp.feature.approvals.components

import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.approvals.R

/** "Type" field next to the status chips (web FilterSelect "Type"); null = all types. */
@Composable
internal fun ApprovalTypeFilter(types: List<String>, selected: String?, onSelect: (String?) -> Unit, modifier: Modifier = Modifier) {
    var open by rememberSaveable { mutableStateOf(false) }
    val allLabel = stringResource(R.string.approvals_type_all)
    PickerField(
        value = selected?.let(::humanizeKey) ?: allLabel,
        label = stringResource(R.string.approvals_type),
        onClick = { open = true },
        icon = Icons.Outlined.FilterList,
        modifier = modifier,
    )
    if (open) {
        AppBottomSheet(title = stringResource(R.string.approvals_type), onDismiss = { open = false }) {
            LazyColumn(Modifier.heightIn(max = 520.dp)) {
                item(key = "all") {
                    ListItemRow(title = allLabel, selected = selected == null, onClick = { open = false; onSelect(null) })
                }
                items(types.size, key = { types[it] }) { index ->
                    val type = types[index]
                    ListItemRow(title = humanizeKey(type), selected = type == selected, onClick = { open = false; onSelect(type) })
                }
            }
        }
    }
}
