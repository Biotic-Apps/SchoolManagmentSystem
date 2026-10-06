package com.schoolapp.feature.progress.components

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

/** Single-select chips that wrap onto new lines (form choices; labels never truncate). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun WrapChoiceChips(
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    FlowRow(modifier = modifier, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { option ->
            FilterChip(
                selected = option.id == selectedId,
                onClick = { onSelect(option.id) },
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
