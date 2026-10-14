package com.schoolapp.feature.meetings.staff

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.LoadMoreRow
import com.schoolapp.feature.meetings.components.MeetingCard
import com.schoolapp.feature.meetings.staff.components.FollowUpCard
import com.schoolapp.feature.meetings.staff.slots.MySlotsActions
import com.schoolapp.feature.meetings.staff.slots.MySlotsOverlays
import com.schoolapp.feature.meetings.staff.slots.MySlotsUiState
import com.schoolapp.feature.meetings.staff.slots.mySlotsTab

internal class StaffMeetingsActions(
    val onTabSelected: (StaffMeetingsTab) -> Unit,
    val onOpenMeeting: (String, MeetingBox) -> Unit,
    val onFollowUpDone: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
    val onLoadMore: (MeetingBox) -> Unit,
    val onRetryMore: (MeetingBox) -> Unit,
    val onSchedule: () -> Unit,
)

@Composable
internal fun StaffMeetingsScreen(
    state: StaffMeetingsUiState,
    slots: MySlotsUiState,
    slotActions: MySlotsActions,
    actions: StaffMeetingsActions,
    modifier: Modifier = Modifier,
) {
    val tabs = visibleStaffTabs(slots.canPublish)
    val onSlotsTab = state.tab == StaffMeetingsTab.SLOTS && slots.canPublish
    val showSchedule = state.canSchedule && !onSlotsTab
    Box(modifier.fillMaxSize()) {
        RefreshBox(
            isRefreshing = if (onSlotsTab) slots.isRefreshing else state.isRefreshing,
            onRefresh = if (onSlotsTab) slotActions.onRefresh else actions.onRefresh,
            modifier = Modifier.fillMaxSize(),
        ) {
            when {
                state.isLoading -> LoadingState()
                state.error != null && state.upcoming.items.isEmpty() && state.past.items.isEmpty() && state.followUps.isEmpty() ->
                    PullableState { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
                else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = if (showSchedule) 88.dp else 16.dp)) {
                    item(key = "tabs") {
                        AppTabs(
                            titles = tabs.map { stringResource(it.titleRes()) },
                            selectedIndex = tabs.indexOf(state.tab).coerceAtLeast(0),
                            onSelect = { actions.onTabSelected(tabs[it]) },
                        )
                    }
                    state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                    state.actionError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                    when (state.tab) {
                        StaffMeetingsTab.UPCOMING -> meetingList(state, MeetingBox.UPCOMING, actions)
                        StaffMeetingsTab.PAST -> meetingList(state, MeetingBox.PAST, actions)
                        StaffMeetingsTab.SLOTS -> if (slots.canPublish) mySlotsTab(slots, slotActions)
                        StaffMeetingsTab.FOLLOW_UPS -> followUpList(state, actions)
                    }
                }
            }
        }
        if (showSchedule && !state.isLoading) {
            AppFloatingButton(
                text = stringResource(R.string.meetings_schedule),
                icon = Icons.Outlined.CalendarMonth,
                onClick = actions.onSchedule,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
    if (onSlotsTab) MySlotsOverlays(slots, slotActions)
}

private fun LazyListScope.meetingList(state: StaffMeetingsUiState, box: MeetingBox, actions: StaffMeetingsActions) {
    val page = state.page(box)
    if (page.items.isEmpty() && !page.hasMore) {
        val empty = if (box == MeetingBox.UPCOMING) R.string.meetings_empty_upcoming else R.string.meetings_empty_past
        item(key = "empty") { EmptyState(stringResource(empty), icon = Icons.Outlined.EventAvailable) }
        return
    }
    items(page.items, key = { it.id }) { MeetingCard(it, forStaff = true, onClick = { actions.onOpenMeeting(it.id, box) }) }
    if (page.hasMore) {
        item(key = "more_${box.name}") { LoadMoreRow(page, { actions.onLoadMore(box) }, { actions.onRetryMore(box) }) }
    }
}

private fun LazyListScope.followUpList(state: StaffMeetingsUiState, actions: StaffMeetingsActions) {
    if (state.followUps.isEmpty()) {
        item(key = "empty") { EmptyState(stringResource(R.string.meetings_empty_follow_ups), icon = Icons.Outlined.TaskAlt) }
        return
    }
    items(state.followUps, key = { it.id }) { followUp ->
        FollowUpCard(
            followUp,
            state.today,
            busy = followUp.id in state.busyFollowUpIds,
            onDone = { actions.onFollowUpDone(followUp.id) },
        )
    }
}

private fun StaffMeetingsTab.titleRes(): Int = when (this) {
    StaffMeetingsTab.UPCOMING -> R.string.meetings_upcoming
    StaffMeetingsTab.PAST -> R.string.meetings_past
    StaffMeetingsTab.SLOTS -> R.string.meetings_my_slots
    StaffMeetingsTab.FOLLOW_UPS -> R.string.meetings_follow_ups
}
