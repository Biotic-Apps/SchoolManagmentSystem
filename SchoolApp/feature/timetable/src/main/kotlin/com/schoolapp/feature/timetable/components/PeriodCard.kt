package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.ScheduleRow

/** One period; the running one gets the selected (rose) background, primary border and a "Now" chip. */
@Composable
internal fun PeriodCard(row: ScheduleRow, isCurrent: Boolean, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = when {
            isCurrent -> AppColors.Selected
            row.isBreak -> AppColors.Background
            else -> AppColors.Surface
        },
        border = BorderStroke(if (isCurrent) 2.dp else 1.dp, if (isCurrent) AppColors.Primary else AppColors.Border),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(row.timeRange, style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
                Text(
                    text = row.title.ifBlank {
                        if (row.isBreak) stringResource(R.string.timetable_break) else stringResource(R.string.timetable_period, row.periodIndex)
                    },
                    style = MaterialTheme.typography.titleMedium,
                    color = if (isCurrent) AppColors.Primary else AppColors.TextPrimary,
                )
                val details = listOfNotNull(row.subtitle, row.room)
                if (details.isNotEmpty()) {
                    Text(details.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (isCurrent) StatusChip(stringResource(R.string.timetable_now), StatusTone.Success)
                if (row.isSubstitute) StatusChip(stringResource(R.string.timetable_substitute), StatusTone.Warning)
            }
        }
    }
}
