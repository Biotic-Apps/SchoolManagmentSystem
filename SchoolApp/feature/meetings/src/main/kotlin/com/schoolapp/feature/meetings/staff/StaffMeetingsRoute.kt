package com.schoolapp.feature.meetings.staff

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.meeting.MeetingBox

@Composable
internal fun StaffMeetingsRoute(
    onOpenMeeting: (String, MeetingBox) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffMeetingsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onResume() }
    StaffMeetingsScreen(
        state = state,
        onTabSelected = viewModel::onTabSelected,
        onOpenMeeting = onOpenMeeting,
        onFollowUpDone = viewModel::markFollowUpDone,
        onRefresh = viewModel::refresh,
        onRetry = viewModel::retry,
        modifier = modifier,
    )
}
