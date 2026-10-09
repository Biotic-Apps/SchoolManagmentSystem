package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SegmentedChoice
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
