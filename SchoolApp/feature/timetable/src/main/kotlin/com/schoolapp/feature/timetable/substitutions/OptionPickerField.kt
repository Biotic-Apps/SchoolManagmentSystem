package com.schoolapp.feature.timetable.substitutions

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors

/** Single choice: a read-only field that opens a bottom sheet of options (copy of the staff form picker). */
@Composable
internal fun OptionPickerField(
    label: String,
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    enabled: Boolean = true,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = options.firstOrNull { it.id == selectedId }?.label.orEmpty(),
        label = label,
        onClick = { open = true },
        modifier = modifier,
        errorText = errorText,
        enabled = enabled,
        icon = Icons.Outlined.ArrowDropDown,
    )
    if (open) {
        AppBottomSheet(title = label, onDismiss = { open = false }) {
            options.forEach { option ->
                val selected = option.id == selectedId
                ListItemRow(
                    title = option.label,
                    supporting = option.supporting,
                    selected = selected,
                    onClick = {
                        open = false
                        onSelect(option.id)
                    },
                    trailing = if (selected) {
                        { Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.Primary) }
                    } else {
                        null
                    },
                )
            }
        }
    }
}
