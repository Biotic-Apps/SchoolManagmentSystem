package com.schoolapp.feature.meetings.parent

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.components.LoadMoreRow
import com.schoolapp.feature.meetings.components.MeetingCard

@Composable
internal fun ParentMeetingsScreen(
    state: ParentMeetingsUiState,
    onBook: () -> Unit,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    onLoadMore: (MeetingBox) -> Unit,
    onRetryMore: (MeetingBox) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {
            when {
                state.isLoading -> LoadingState()
                state.noChild -> PullableState { EmptyState(stringResource(R.string.meetings_no_child), icon = Icons.Outlined.Groups) }
                state.error != null && state.upcoming.items.isEmpty() && state.past.items.isEmpty() -> PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                    state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                    item(key = "upcoming_header") { SectionHeader(stringResource(R.string.meetings_upcoming)) }
                    if (state.upcoming.items.isEmpty()) {
                        item(key = "upcoming_empty") {
                            EmptyState(stringResource(R.string.meetings_empty_upcoming), message = stringResource(R.string.meetings_empty_upcoming_hint), icon = Icons.Outlined.EventAvailable)
                        }
                    }
                    items(state.upcoming.items, key = { "u_${it.id}" }) { MeetingCard(it, forStaff = false) }
                    if (state.upcoming.hasMore) {
                        item(key = "u_more") {
                            LoadMoreRow(state.upcoming, { onLoadMore(MeetingBox.UPCOMING) }, { onRetryMore(MeetingBox.UPCOMING) })
                        }
                    }
                    if (state.past.items.isNotEmpty()) {
                        item(key = "past_header") { SectionHeader(stringResource(R.string.meetings_past)) }
                        items(state.past.items, key = { "p_${it.id}" }) { MeetingCard(it, forStaff = false, showSummary = true) }
                        if (state.past.hasMore) {
                            item(key = "p_more") { LoadMoreRow(state.past, { onLoadMore(MeetingBox.PAST) }, { onRetryMore(MeetingBox.PAST) }) }
                        }
                    }
                }
            }
        }
        if (!state.noChild && !state.isLoading) {
            AppFloatingButton(
                text = stringResource(R.string.meetings_book),
                icon = Icons.Outlined.EventAvailable,
                onClick = onBook,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}
