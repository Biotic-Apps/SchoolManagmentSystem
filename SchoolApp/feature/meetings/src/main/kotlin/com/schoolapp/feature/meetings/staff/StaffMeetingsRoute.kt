package com.schoolapp.feature.meetings.staff

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.staff.slots.MySlotsActions
import com.schoolapp.feature.meetings.staff.slots.MySlotsViewModel
import com.schoolapp.feature.meetings.staff.slots.PublishSlotsActions

@Composable
internal fun StaffMeetingsRoute(
    onOpenMeeting: (String, MeetingBox) -> Unit,
    onSchedule: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffMeetingsViewModel = hiltViewModel(),
    slotsViewModel: MySlotsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val slots by slotsViewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.onResume()
        slotsViewModel.onResume()
    }
    val slotActions = remember(slotsViewModel) { slotsViewModel.actions() }
    StaffMeetingsScreen(
        state = state,
        slots = slots,
        slotActions = slotActions,
        actions = StaffMeetingsActions(
            onTabSelected = viewModel::onTabSelected,
            onOpenMeeting = onOpenMeeting,
            onFollowUpDone = viewModel::markFollowUpDone,
            onRefresh = viewModel::refresh,
            onRetry = viewModel::retry,
            onLoadMore = viewModel::loadMore,
            onRetryMore = viewModel::retryMore,
            onSchedule = onSchedule,
        ),
        modifier = modifier,
    )
}

private fun MySlotsViewModel.actions() = MySlotsActions(
    onPreviousWeek = ::previousWeek,
    onNextWeek = ::nextWeek,
    onThisWeek = ::thisWeek,
    onRetry = ::retry,
    onRefresh = ::refresh,
    onAskDelete = ::askDelete,
    onDismissDelete = ::dismissDelete,
    onConfirmDelete = ::confirmDelete,
    onOpenSheet = ::openSheet,
    sheet = PublishSlotsActions(
        onUpdate = ::updateDraft,
        onAddRow = ::addRow,
        onRemoveRow = ::removeRow,
        onSubmit = ::publish,
        onDismiss = ::dismissSheet,
    ),
)
