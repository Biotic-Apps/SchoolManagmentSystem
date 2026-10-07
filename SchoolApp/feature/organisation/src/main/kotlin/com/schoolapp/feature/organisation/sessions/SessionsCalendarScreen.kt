package com.schoolapp.feature.organisation.sessions

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.calendar.CalendarEventCard
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.PullableState
import com.schoolapp.feature.organisation.components.RefreshErrorBanner
import com.schoolapp.feature.organisation.scope.BranchScopeBar
import com.schoolapp.feature.organisation.scope.ScopedPane
import com.schoolapp.feature.organisation.sessions.components.SessionCard

@Composable
fun SessionsCalendarScreen(
    state: SessionsCalendarUiState,
    onBranchSelected: (String) -> Unit,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScopedPane(modifier) {
        BranchScopeBar(state.branches, state.selectedBranchId, onBranchSelected)
        if (state.isLoading) {
            LoadingState()
        } else {
            RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxWidth().weight(1f)) {
                when {
                    state.error != null && !state.hasContent ->
                        PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                    state.sessions.isEmpty() -> PullableState {
                        EmptyState(
                            title = stringResource(R.string.org_sessions_empty),
                            message = stringResource(R.string.org_read_only_hint),
                            icon = Icons.Outlined.CalendarMonth,
                        )
                    }
                    else -> SessionsAndEvents(state)
                }
            }
        }
    }
}

@Composable
private fun SessionsAndEvents(state: SessionsCalendarUiState) {
    ScreenColumn {
        if (state.error != null) item(key = "refresh-error") { RefreshErrorBanner(state.error) }
        item(key = "sessions-header") { SectionHeader(stringResource(R.string.org_sessions_title)) }
        items(state.sessions, key = { it.id }) { SessionCard(it) }
        item(key = "calendar-header") {
            SectionHeader(
                title = stringResource(R.string.org_calendar_title),
                subtitle = state.activeSession?.name,
            )
        }
        if (state.events.isEmpty()) {
            item(key = "calendar-empty") { EmptyState(title = stringResource(R.string.org_calendar_empty)) }
        }
        items(state.events, key = { "event-${it.id}" }) { CalendarEventCard(it) }
    }
}

@Preview(showBackground = true)
@Composable
private fun SessionsCalendarScreenPreview() = SchoolTheme {
    SessionsCalendarScreen(
        state = SessionsCalendarUiState(
            isLoading = false,
            branches = listOf(BranchOption("b1", "Main Branch", "s1")),
            selectedBranchId = "b1",
            sessions = listOf(AcademicSession("1", "b1", "2026-27", "2026-04-01", "2027-03-31", "ACTIVE", 3)),
            events = listOf(CalendarEvent("e1", "HOLIDAY", "Independence Day", "2026-08-14", "2026-08-14", null)),
        ),
        onBranchSelected = {}, onRetry = {}, onRefresh = {},
    )
}
