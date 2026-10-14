package com.schoolapp.feature.exams.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors

/** Read-only field that opens a dropdown of [options]; [selectedId] null shows [placeholder]. */
@Composable
internal fun OptionPickerField(
    label: String,
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    errorText: String? = null,
    enabled: Boolean = true,
) {
    var expanded by rememberSaveable { mutableStateOf(false) }
    val selected = options.firstOrNull { it.id == selectedId }
    Box(modifier) {
        PickerField(
            value = selected?.label ?: placeholder,
            label = label,
            onClick = { if (options.isNotEmpty()) expanded = true },
            errorText = errorText,
            enabled = enabled,
            icon = Icons.Outlined.ExpandMore,
        )
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }, containerColor = AppColors.Surface) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = {
                        Column {
                            Text(option.label, style = MaterialTheme.typography.bodyLarge)
                            option.supporting?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
                        }
                    },
                    trailingIcon = if (option.id == selectedId) {
                        { Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.Primary) }
                    } else {
                        null
                    },
                    onClick = {
                        expanded = false
                        onSelect(option.id)
                    },
                )
            }
        }
    }
}
