package com.schoolapp.feature.dashboard.scope

import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption

/** One scope level (school, branch or session): a field that opens a sheet with "All …" plus [options]. */
@Composable
internal fun ScopeLevelField(
    label: String,
    allLabel: String,
    options: List<SwitcherOption>,
    selectedId: String?,
    icon: ImageVector,
    onSelect: (String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = options.firstOrNull { it.id == selectedId }?.label ?: allLabel,
        label = label,
        onClick = { open = true },
        icon = icon,
        modifier = modifier,
    )
    if (open) {
        AppBottomSheet(title = label, onDismiss = { open = false }) {
            LazyColumn(Modifier.heightIn(max = 480.dp)) {
                item(key = "all") {
                    ListItemRow(title = allLabel, selected = selectedId == null, onClick = { open = false; onSelect(null) })
                }
                items(options.size, key = { options[it].id }) { index ->
                    val option = options[index]
                    ListItemRow(
                        title = option.label,
                        supporting = option.supporting,
                        selected = option.id == selectedId,
                        onClick = { open = false; onSelect(option.id) },
                    )
                }
            }
        }
    }
}
