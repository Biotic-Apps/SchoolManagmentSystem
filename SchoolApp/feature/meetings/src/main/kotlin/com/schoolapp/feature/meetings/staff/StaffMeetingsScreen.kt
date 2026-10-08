package com.schoolapp.feature.meetings.staff

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
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
import com.schoolapp.feature.meetings.components.MeetingCard
import com.schoolapp.feature.meetings.staff.components.FollowUpCard
import com.schoolapp.feature.meetings.staff.slots.MySlotsActions
import com.schoolapp.feature.meetings.staff.slots.MySlotsOverlays
import com.schoolapp.feature.meetings.staff.slots.MySlotsUiState
import com.schoolapp.feature.meetings.staff.slots.mySlotsTab

@Composable
internal fun StaffMeetingsScreen(
    state: StaffMeetingsUiState,
    slots: MySlotsUiState,
    slotActions: MySlotsActions,
    onTabSelected: (StaffMeetingsTab) -> Unit,
    onOpenMeeting: (String, MeetingBox) -> Unit,
    onFollowUpDone: (String) -> Unit,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tabs = visibleStaffTabs(slots.canPublish)
    val onSlotsTab = state.tab == StaffMeetingsTab.SLOTS && slots.canPublish
    RefreshBox(
        isRefreshing = if (onSlotsTab) slots.isRefreshing else state.isRefreshing,
        onRefresh = if (onSlotsTab) slotActions.onRefresh else onRefresh,
        modifier = modifier,
    ) {
        when {
            state.isLoading -> LoadingState()
            state.error != null && state.upcoming.isEmpty() && state.past.isEmpty() && state.followUps.isEmpty() ->
                PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            else -> ScreenColumn {
                item(key = "tabs") {
                    AppTabs(
                        titles = tabs.map { stringResource(it.titleRes()) },
                        selectedIndex = tabs.indexOf(state.tab).coerceAtLeast(0),
                        onSelect = { onTabSelected(tabs[it]) },
                    )
                }
                state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                state.actionError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                when (state.tab) {
                    StaffMeetingsTab.UPCOMING -> if (state.upcoming.isEmpty()) {
                        item(key = "empty") { EmptyState(stringResource(R.string.meetings_empty_upcoming), icon = Icons.Outlined.EventAvailable) }
                    } else {
                        items(state.upcoming, key = { it.id }) { MeetingCard(it, forStaff = true, onClick = { onOpenMeeting(it.id, MeetingBox.UPCOMING) }) }
                    }
                    StaffMeetingsTab.PAST -> if (state.past.isEmpty()) {
                        item(key = "empty") { EmptyState(stringResource(R.string.meetings_empty_past), icon = Icons.Outlined.EventAvailable) }
                    } else {
                        items(state.past, key = { it.id }) { MeetingCard(it, forStaff = true, onClick = { onOpenMeeting(it.id, MeetingBox.PAST) }) }
                    }
                    StaffMeetingsTab.SLOTS -> if (slots.canPublish) mySlotsTab(slots, slotActions)
                    StaffMeetingsTab.FOLLOW_UPS -> if (state.followUps.isEmpty()) {
                        item(key = "empty") { EmptyState(stringResource(R.string.meetings_empty_follow_ups), icon = Icons.Outlined.TaskAlt) }
                    } else {
                        items(state.followUps, key = { it.id }) { followUp ->
                            FollowUpCard(followUp, state.today, busy = followUp.id in state.busyFollowUpIds, onDone = { onFollowUpDone(followUp.id) })
                        }
                    }
                }
            }
        }
    }
    if (onSlotsTab) MySlotsOverlays(slots, slotActions)
}

private fun StaffMeetingsTab.titleRes(): Int = when (this) {
    StaffMeetingsTab.UPCOMING -> R.string.meetings_upcoming
    StaffMeetingsTab.PAST -> R.string.meetings_past
    StaffMeetingsTab.SLOTS -> R.string.meetings_my_slots
    StaffMeetingsTab.FOLLOW_UPS -> R.string.meetings_follow_ups
}
