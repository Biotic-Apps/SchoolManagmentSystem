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
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.MeetingCard
import com.schoolapp.feature.meetings.staff.components.FollowUpCard

@Composable
internal fun StaffMeetingsScreen(
    state: StaffMeetingsUiState,
    onTabSelected: (StaffMeetingsTab) -> Unit,
    onOpenMeeting: (String, MeetingBox) -> Unit,
    onFollowUpDone: (String) -> Unit,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh, modifier = modifier) {
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
            else -> ScreenColumn {
                item(key = "tabs") {
                    AppTabs(
                        titles = listOf(
                            stringResource(R.string.meetings_upcoming),
                            stringResource(R.string.meetings_past),
                            stringResource(R.string.meetings_follow_ups),
                        ),
                        selectedIndex = state.tab.ordinal,
                        onSelect = { onTabSelected(StaffMeetingsTab.entries[it]) },
                    )
                }
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
}
