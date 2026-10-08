package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.TeacherView

/** "My week | My sections" switch shown to teachers above the timetable. */
@Composable
internal fun TeacherViewSwitch(selected: TeacherView, onSelect: (TeacherView) -> Unit, modifier: Modifier = Modifier) {
    SegmentedChoice(
        labels = listOf(stringResource(R.string.timetable_view_week), stringResource(R.string.timetable_view_sections)),
        selectedIndex = selected.ordinal,
        onSelect = { onSelect(TeacherView.entries[it]) },
        modifier = modifier.widthIn(max = 480.dp),
    )
}

/** Teal single-choice segmented row. */
@Composable
internal fun SegmentedChoice(labels: List<String>, selectedIndex: Int, onSelect: (Int) -> Unit, modifier: Modifier = Modifier) {
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
