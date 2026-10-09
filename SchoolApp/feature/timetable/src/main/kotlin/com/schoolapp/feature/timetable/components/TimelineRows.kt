package com.schoolapp.feature.timetable.components

import com.schoolapp.core.designsystem.component.AppCard
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.RowKind
import com.schoolapp.feature.timetable.RowMarker
import com.schoolapp.feature.timetable.ScheduleRow

/** One timeline entry: a lesson card, a slim break divider or a light "Free" row. */
@Composable
internal fun TimelineRow(row: ScheduleRow, marker: RowMarker?, onOpen: (ScheduleRow) -> Unit, modifier: Modifier = Modifier) {
    when (row.kind) {
        RowKind.LESSON -> LessonCard(row, marker, onOpen, modifier)
        RowKind.BREAK -> BreakRow(row, marker == RowMarker.NOW, modifier)
        RowKind.FREE -> FreeRow(row, marker == RowMarker.NOW, modifier)
    }
}

@Composable
internal fun periodCaption(row: ScheduleRow): String {
    val name = row.periodNumber?.let { stringResource(R.string.timetable_period, it) }
    return listOfNotNull(name, row.timeRange.ifBlank { null }).joinToString(" · ")
}

@Composable
private fun LessonCard(row: ScheduleRow, marker: RowMarker?, onOpen: (ScheduleRow) -> Unit, modifier: Modifier) {
    val isNow = marker == RowMarker.NOW
    AppCard(modifier.fillMaxWidth(), onClick = { onOpen(row) }, selected = isNow, contentPadding = 0.dp) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(periodCaption(row), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
                Text(
                    text = row.title.ifBlank { stringResource(R.string.timetable_period, row.periodNumber ?: row.periodIndex) },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isNow) AppColors.OnSelected else AppColors.TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                val details = listOfNotNull(row.subtitle, row.room)
                if (details.isNotEmpty()) {
                    Text(details.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                when (marker) {
                    RowMarker.NOW -> StatusChip(stringResource(R.string.timetable_now), StatusTone.Success)
                    RowMarker.NEXT -> StatusChip(stringResource(R.string.timetable_next), StatusTone.Info)
                    null -> Unit
                }
                if (row.isSubstitute) StatusChip(stringResource(R.string.timetable_substitute), StatusTone.Warning)
            }
        }
    }
}

@Composable
private fun BreakRow(row: ScheduleRow, isNow: Boolean, modifier: Modifier) {
    val label = row.title.ifBlank { stringResource(R.string.timetable_break) }
    Row(modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        HorizontalDivider(Modifier.weight(1f), color = AppColors.Border)
        Text(
            text = listOf(label, row.timeRange).filter { it.isNotBlank() }.joinToString(" · "),
            style = MaterialTheme.typography.labelMedium,
            color = if (isNow) AppColors.Primary else AppColors.TextSecondary,
            modifier = Modifier.padding(horizontal = 12.dp),
        )
        HorizontalDivider(Modifier.weight(1f), color = AppColors.Border)
    }
}

@Composable
private fun FreeRow(row: ScheduleRow, isNow: Boolean, modifier: Modifier) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = AppColors.Background,
        border = BorderStroke(1.dp, if (isNow) AppColors.Primary else AppColors.Border.copy(alpha = 0.6f)),
    ) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(periodCaption(row), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary, modifier = Modifier.weight(1f))
            Text(stringResource(R.string.timetable_free), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
        }
    }
}
