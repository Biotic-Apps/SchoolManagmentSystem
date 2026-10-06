package com.schoolapp.feature.timetable

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.timetable.components.PeriodCard

@Composable
fun TimetableScreen(
    state: TimetableUiState,
    onDaySelected: (Int) -> Unit,
    onSectionSelected: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dayNames = stringArrayResource(R.array.timetable_days_short)
    Column(modifier.fillMaxSize()) {
        if (state.mode == TimetableMode.SECTION && state.sections.isNotEmpty()) {
            FilterChipRow(
                options = state.sections,
                selectedId = state.selectedSectionId,
                onSelect = onSectionSelected,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            )
        }
        state.subtitle?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary, modifier = Modifier.padding(16.dp, 8.dp))
        }
        if (state.days.isNotEmpty()) {
            AppTabs(
                titles = state.days.map { dayNames.getOrElse(it - 1) { it.toString() } },
                selectedIndex = state.days.indexOf(state.selectedDay).coerceAtLeast(0),
                onSelect = { onDaySelected(state.days[it]) },
            )
        }
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
            state.mode == TimetableMode.SECTION && state.sections.isEmpty() ->
                EmptyState(stringResource(R.string.timetable_no_sections), icon = Icons.Outlined.Schedule)
            state.dayRows.isEmpty() -> EmptyState(stringResource(R.string.timetable_empty_day), icon = Icons.Outlined.Schedule)
            else -> ScreenColumn {
                items(state.dayRows, key = { "${it.day}-${it.periodIndex}" }) { row ->
                    PeriodCard(row, isCurrent = row.periodIndex == state.highlightedPeriod)
                }
                item(key = "hint") {
                    Text(stringResource(R.string.timetable_read_only), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun TimetableScreenPreview() = SchoolTheme {
    TimetableScreen(
        state = TimetableUiState(
            isLoading = false,
            days = listOf(1, 2, 3, 4, 5, 6),
            rows = listOf(
                ScheduleRow(1, 1, "08:00", "08:40", "8:00 AM – 8:40 AM", "Mathematics", "Class 5 - A", "Room 12"),
                ScheduleRow(1, 2, "08:40", "09:20", "8:40 AM – 9:20 AM", "Mathematics", "Class 5 - B", "Room 14", isSubstitute = true),
            ),
            currentPeriodIndex = 2,
        ),
        onDaySelected = {}, onSectionSelected = {}, onRetry = {},
    )
}
