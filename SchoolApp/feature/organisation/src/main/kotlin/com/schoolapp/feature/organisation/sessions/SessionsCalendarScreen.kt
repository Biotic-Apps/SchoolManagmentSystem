package com.schoolapp.feature.organisation.sessions

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.AppTextButton
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
import com.schoolapp.feature.organisation.components.RefreshErrorBanner
import com.schoolapp.feature.organisation.scope.BranchScopeBar
import com.schoolapp.feature.organisation.sessions.components.MonthSwitcher
import com.schoolapp.feature.organisation.sessions.components.SessionCard
import com.schoolapp.feature.organisation.sessions.components.SessionCardActions

/** Screen callbacks; editing ones are only wired when the role holds `sessions.add/edit`. */
data class SessionsCalendarActions(
    val onBranchSelected: (String) -> Unit = {},
    val onRetry: () -> Unit = {},
    val onRefresh: () -> Unit = {},
    val onShiftMonth: (Long) -> Unit = {},
    val onNewSession: () -> Unit = {},
    val session: SessionCardActions = SessionCardActions(),
    val onAddEvent: () -> Unit = {},
    val onOpenEvent: (CalendarEvent) -> Unit = {},
)

@Composable
fun SessionsCalendarScreen(
    state: SessionsCalendarUiState,
    actions: SessionsCalendarActions,
    modifier: Modifier = Modifier,
    notices: (@Composable () -> Unit)? = null,
) {
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier.fillMaxSize()) {
        ScreenColumn {
            if (state.branches.isNotEmpty()) {
                item(key = "scope") { BranchScopeBar(state.branches, state.selectedBranchId, actions.onBranchSelected) }
            }
            if (notices != null) item(key = "notices") { notices() }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null && !state.hasContent ->
                    item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
                state.selectedBranchId == null -> item(key = "no-branch") {
                    EmptyState(title = stringResource(R.string.org_no_branch), message = stringResource(R.string.org_no_branch_hint))
                }
                else -> sessionsAndEvents(state, actions)
            }
        }
    }
}

private fun LazyListScope.sessionsAndEvents(state: SessionsCalendarUiState, actions: SessionsCalendarActions) {
    if (state.error != null) item(key = "refresh-error") { RefreshErrorBanner(state.error) }
    item(key = "sessions-header") {
        SectionHeader(
            title = stringResource(R.string.org_sessions_title),
            action = if (state.canAddSession) {
                { AppTextButton(stringResource(R.string.org_new_session), onClick = actions.onNewSession, leadingIcon = Icons.Outlined.Add) }
            } else {
                null
            },
        )
    }
    if (state.sessions.isEmpty()) {
        item(key = "sessions-empty") {
            EmptyState(
                title = stringResource(R.string.org_sessions_empty),
                message = stringResource(R.string.org_sessions_empty_hint),
                icon = Icons.Outlined.CalendarMonth,
            )
        }
    }
    items(state.sessions, key = { it.id }) { SessionCard(it, actions = actions.session) }
    item(key = "calendar-header") {
        SectionHeader(
            title = stringResource(R.string.org_calendar_title),
            action = if (state.canEdit) {
                { AppTextButton(stringResource(R.string.org_add_event), onClick = actions.onAddEvent, leadingIcon = Icons.Outlined.Add) }
            } else {
                null
            },
        )
    }
    item(key = "month") { MonthSwitcher(state.month, actions.onShiftMonth) }
    when {
        state.eventsLoading -> item(key = "events-loading") { LoadingState() }
        state.events.isEmpty() -> item(key = "calendar-empty") {
            EmptyState(title = stringResource(R.string.org_calendar_empty), message = stringResource(R.string.org_calendar_empty_hint))
        }
        else -> items(state.events, key = { "event-${it.id}" }) { event ->
            val open = if (state.canEdit) Modifier.clip(MaterialTheme.shapes.medium).clickable { actions.onOpenEvent(event) } else Modifier
            CalendarEventCard(event, open)
        }
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
            canAddSession = true,
            canEdit = true,
        ),
        actions = SessionsCalendarActions(),
    )
}
