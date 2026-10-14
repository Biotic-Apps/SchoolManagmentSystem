package com.schoolapp.feature.settings.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors

/** Read-only field that opens a bottom sheet list of [options]; used for school, branch, session and filters. */
@Composable
internal fun OptionPickerField(
    label: String,
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    enabled: Boolean = true,
    errorText: String? = null,
    icon: ImageVector = Icons.Outlined.ExpandMore,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    val selected = options.firstOrNull { it.id == selectedId }
    PickerField(
        value = selected?.label ?: placeholder,
        label = label,
        onClick = { open = true },
        modifier = modifier,
        errorText = errorText,
        enabled = enabled && options.isNotEmpty(),
        icon = icon,
    )
    if (open) {
        AppBottomSheet(title = label, onDismiss = { open = false }) {
            options.forEach { option ->
                val isSelected = option.id == selectedId
                ListItemRow(
                    title = option.label,
                    supporting = option.supporting,
                    selected = isSelected,
                    onClick = {
                        open = false
                        onSelect(option.id)
                    },
                    trailing = if (isSelected) {
                        { Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.Primary) }
                    } else {
                        null
                    },
                )
            }
        }
    }
}
