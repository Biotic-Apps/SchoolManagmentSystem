package com.schoolapp.feature.timetable.calendar

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.calendar.CalendarEventCard
import com.schoolapp.feature.timetable.R

@Composable
internal fun SchoolCalendarRoute(modifier: Modifier = Modifier, viewModel: SchoolCalendarViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SchoolCalendarScreen(state, onRefresh = viewModel::refresh, onRetry = viewModel::retry, modifier = modifier)
}

/** "Upcoming school calendar": holidays, vacations, events and deadlines for the next 90 days. */
@Composable
internal fun SchoolCalendarScreen(
    state: SchoolCalendarUiState,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val error = state.error
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh, modifier = modifier) {
        when {
            state.childId == null && !state.isLoading ->
                PullableState { EmptyState(stringResource(R.string.timetable_no_child), icon = Icons.Outlined.FamilyRestroom) }
            state.isLoading -> LoadingState()
            error != null -> PullableState { ErrorState(appErrorMessage(error), onRetry = onRetry) }
            else -> ScreenColumn {
                item(key = "header") {
                    SectionHeader(
                        title = stringResource(R.string.timetable_calendar_title),
                        subtitle = stringResource(R.string.timetable_calendar_window, state.days),
                    )
                }
                if (state.events.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(stringResource(R.string.timetable_calendar_empty), icon = Icons.Outlined.CalendarMonth)
                    }
                } else {
                    items(state.events, key = { "event-${it.id}" }) { CalendarEventCard(it) }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun SchoolCalendarScreenPreview() = SchoolTheme {
    SchoolCalendarScreen(
        state = SchoolCalendarUiState(
            childId = "c1",
            isLoading = false,
            events = listOf(
                CalendarEvent("e1", "HOLIDAY", "Founders' Day", "2026-10-20", "2026-10-20", "School closed"),
                CalendarEvent("e2", "VACATION", "Winter vacation", "2026-12-22", "2027-01-02", null),
            ),
        ),
        onRefresh = {}, onRetry = {},
    )
}
