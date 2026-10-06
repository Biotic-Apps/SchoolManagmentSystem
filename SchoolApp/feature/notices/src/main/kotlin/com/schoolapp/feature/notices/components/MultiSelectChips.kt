package com.schoolapp.feature.notices.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors

/** Wrapping multi-select chips (labels wrap instead of being cut). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun MultiSelectChips(
    options: List<SwitcherOption>,
    selectedIds: Set<String>,
    onToggle: (String) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    FlowRow(modifier = modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        options.forEach { option ->
            val selected = option.id in selectedIds
            FilterChip(
                selected = selected,
                onClick = { onToggle(option.id) },
                enabled = enabled,
                label = { Text(option.label) },
                leadingIcon = if (selected) ({ Icon(Icons.Outlined.Check, contentDescription = null) }) else null,
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
