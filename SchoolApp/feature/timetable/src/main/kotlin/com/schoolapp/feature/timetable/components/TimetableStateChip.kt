package com.schoolapp.feature.timetable.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.feature.timetable.R

/** Editors' lifecycle chip: draft, published (with version) or published with unpublished changes. */
@Composable
internal fun TimetableStateChip(state: TimetableState, version: Int?, modifier: Modifier = Modifier) {
    val (text, tone) = when (state) {
        TimetableState.EMPTY, TimetableState.DRAFT -> stringResource(R.string.timetable_state_draft) to StatusTone.Warning
        TimetableState.PUBLISHED_WITH_CHANGES -> stringResource(R.string.timetable_state_changes) to StatusTone.Info
        TimetableState.PUBLISHED -> {
            val label = version?.takeIf { it > 0 }?.let { stringResource(R.string.timetable_state_published_version, it) }
            (label ?: stringResource(R.string.timetable_state_published)) to StatusTone.Success
        }
    }
    StatusChip(text, tone, modifier)
}
