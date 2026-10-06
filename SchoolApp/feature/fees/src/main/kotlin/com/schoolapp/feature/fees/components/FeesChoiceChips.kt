package com.schoolapp.feature.fees.components

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

/** Single-choice chips that wrap onto new lines so every option stays visible. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun FeesChoiceChips(
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { option ->
            FilterChip(
                selected = option.id == selectedId,
                onClick = { onSelect(option.id) },
                enabled = enabled,
                label = { Text(option.label) },
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
