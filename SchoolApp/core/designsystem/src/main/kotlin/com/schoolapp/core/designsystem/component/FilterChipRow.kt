package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors

/** Single-select chips that scroll horizontally on narrow screens. */
@Composable
fun FilterChipRow(
    options: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        options.forEach { option ->
            FilterChip(
                selected = option.id == selectedId,
                onClick = { onSelect(option.id) },
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

@Preview
@Composable
private fun FilterChipRowPreview() = PreviewContainer {
    FilterChipRow(
        options = listOf(SwitcherOption("p", "Pending"), SwitcherOption("a", "Approved"), SwitcherOption("r", "Rejected")),
        selectedId = "p",
        onSelect = {},
    )
}
