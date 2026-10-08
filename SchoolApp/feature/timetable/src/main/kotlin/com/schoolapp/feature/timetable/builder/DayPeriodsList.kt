package com.schoolapp.feature.timetable.builder

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.timetable.ConflictSeverity
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.feature.timetable.R

/** One day's periods: lessons (tap to edit), empty periods ("Tap to add a lesson"), breaks; live conflict notes. */
@Composable
internal fun DayPeriodsList(builder: TimetableBuilder, day: Int, canEdit: Boolean, onOpen: (Int) -> Unit, modifier: Modifier = Modifier) {
    val periods = builder.draft.periodsFor(day)
    if (periods.isEmpty()) {
        Text(
            stringResource(R.string.tt_no_bell),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = modifier,
        )
        return
    }
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(periods, key = { it.index }) { period -> PeriodRow(builder, day, period, canEdit, onOpen) }
    }
}

@Composable
private fun PeriodRow(builder: TimetableBuilder, day: Int, period: Period, canEdit: Boolean, onOpen: (Int) -> Unit) {
    if (period.isBreak) {
        Text(
            "${period.label ?: stringResource(R.string.tt_break)} · ${timeRange(period)}",
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = Modifier.fillMaxWidth(),
        )
        return
    }
    val slot = builder.draft.slotAt(day, period.index)
    val conflicts = builder.conflicts.filter { it.day == day && it.periodIndex == period.index }
    AppCard(Modifier.fillMaxWidth(), onClick = { onOpen(period.index) }.takeIf { canEdit }) {
        Text(
            stringResource(R.string.tt_period_time, period.number ?: period.index, timeRange(period)),
            style = MaterialTheme.typography.labelMedium,
            color = AppColors.TextSecondary,
        )
        if (slot == null) {
            Text(
                stringResource(if (canEdit) R.string.tt_tap_to_add else R.string.tt_free),
                style = MaterialTheme.typography.bodyLarge,
                color = AppColors.TextSecondary,
            )
        } else {
            Column {
                Text(slot.subject.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(
                    listOfNotNull(slot.staff.name.ifBlank { null }, slot.room?.name).joinToString(" · "),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
            }
        }
        conflicts.forEach { conflict ->
            InlineMessage(conflict.message, if (conflict.severity == ConflictSeverity.ERROR) StatusTone.Error else StatusTone.Warning)
        }
    }
}
