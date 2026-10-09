package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors

/** Teal single-choice segmented row (2-4 short options), e.g. "Staff | Parent" or "My week | My sections". */
@Composable
fun SegmentedChoice(labels: List<String>, selectedIndex: Int, onSelect: (Int) -> Unit, modifier: Modifier = Modifier) {
    SingleChoiceSegmentedButtonRow(modifier.fillMaxWidth()) {
        labels.forEachIndexed { index, label ->
            SegmentedButton(
                selected = index == selectedIndex,
                onClick = { onSelect(index) },
                shape = SegmentedButtonDefaults.itemShape(index, labels.size),
                colors = SegmentedButtonDefaults.colors(
                    activeContainerColor = AppColors.Selected,
                    activeContentColor = AppColors.OnSelected,
                    activeBorderColor = AppColors.Primary,
                    inactiveContainerColor = AppColors.Surface,
                    inactiveContentColor = AppColors.TextPrimary,
                    inactiveBorderColor = AppColors.Border,
                ),
            ) { Text(label) }
        }
    }
}

@Preview
@Composable
private fun SegmentedChoicePreview() = PreviewContainer {
    SegmentedChoice(labels = listOf("Staff", "Parent"), selectedIndex = 0, onSelect = {})
}
