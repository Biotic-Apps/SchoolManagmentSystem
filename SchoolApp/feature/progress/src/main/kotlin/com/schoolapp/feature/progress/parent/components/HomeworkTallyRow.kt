package com.schoolapp.feature.progress.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.parent.HomeworkTally

/** Counts by tick; wraps on narrow screens. Zero counts are hidden. */
@Composable
internal fun HomeworkTallyRow(tally: HomeworkTally, modifier: Modifier = Modifier) {
    val chips = listOf(
        Triple(tally.done, R.string.progress_tally_done, StatusTone.Success),
        Triple(tally.partial, R.string.progress_tally_partial, StatusTone.Warning),
        Triple(tally.notDone, R.string.progress_tally_not_done, StatusTone.Error),
        Triple(tally.unchecked, R.string.progress_tally_unchecked, StatusTone.Neutral),
    ).filter { it.first > 0 }
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        chips.forEach { (count, label, tone) -> StatusChip(stringResource(label, count), tone) }
    }
}
