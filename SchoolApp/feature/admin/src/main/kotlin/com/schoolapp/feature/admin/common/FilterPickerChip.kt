package com.schoolapp.feature.admin.common

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors

/**
 * A list filter as a chip ("Role: Teacher"); tapping opens a sheet with "All" plus [options].
 * [selectedId] null means all.
 */
@Composable
internal fun FilterPickerChip(
    label: String,
    allLabel: String,
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    val selected = options.firstOrNull { it.id == selectedId }
    FilterChip(
        selected = selected != null,
        onClick = { open = true },
        label = { Text(selected?.let { "$label: ${it.label}" } ?: label) },
        trailingIcon = { Icon(Icons.Outlined.ArrowDropDown, contentDescription = null) },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = AppColors.Selected,
            selectedLabelColor = AppColors.OnSelected,
            selectedTrailingIconColor = AppColors.OnSelected,
        ),
        modifier = modifier,
    )
    if (open) {
        AppBottomSheet(title = label, onDismiss = { open = false }) {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                (listOf(SwitcherOption(ALL, allLabel)) + options).forEach { option ->
                    val isSelected = option.id == (selectedId ?: ALL)
                    ListItemRow(
                        title = option.label,
                        supporting = option.supporting,
                        selected = isSelected,
                        onClick = {
                            open = false
                            onSelect(option.id.takeIf { it != ALL })
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
}

private const val ALL = "__all__"
