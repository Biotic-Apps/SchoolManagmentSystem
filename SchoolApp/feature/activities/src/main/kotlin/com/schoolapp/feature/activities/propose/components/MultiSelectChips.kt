package com.schoolapp.feature.activities.propose.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors

/** Wrapping multi-select chips (sections), styled like the shared single-select chip row. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun MultiSelectChips(
    options: List<SwitcherOption>,
    selectedIds: Set<String>,
    onToggle: (String) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { option ->
            FilterChip(
                selected = option.id in selectedIds,
                onClick = { onToggle(option.id) },
                label = { Text(option.label) },
                enabled = enabled,
                colors = FilterChipDefaults.filterChipColors(
                    containerColor = AppColors.Surface,
                    labelColor = AppColors.TextPrimary,
                    selectedContainerColor = AppColors.Selected,
                    selectedLabelColor = AppColors.Primary,
                ),
            )
        }
    }
}
