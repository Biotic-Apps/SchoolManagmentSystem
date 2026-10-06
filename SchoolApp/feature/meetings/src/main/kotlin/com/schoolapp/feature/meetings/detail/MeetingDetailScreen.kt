package com.schoolapp.feature.meetings.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.detail.components.MeetingActionsBar
import com.schoolapp.feature.meetings.detail.components.MeetingInfoCard
import com.schoolapp.feature.meetings.detail.components.MeetingOutcomeCard
import com.schoolapp.feature.meetings.detail.components.hasOutcome

@Composable
internal fun MeetingDetailScreen(
    state: MeetingDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onComplete: () -> Unit,
    onCancel: () -> Unit,
    onNoShow: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.meetings_detail_title), navigationIcon = { BackButton(onBack) }) },
        bottomBar = {
            if (state.canAct) MeetingActionsBar(state.busy, onComplete = onComplete, onCancel = onCancel, onNoShow = onNoShow)
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val meeting = state.meeting
        when {
            state.isLoading -> LoadingState(body)
            state.error != null && meeting == null -> ErrorState(appErrorMessage(state.error), body, onRetry = onRetry)
            meeting == null -> EmptyState(stringResource(R.string.meetings_not_found), body, icon = Icons.Outlined.EventBusy)
            else -> ScreenColumn(body) {
                state.done?.let { item(key = "done") { InlineMessage(stringResource(it.doneRes()), StatusTone.Success) } }
                val sheetOpen = state.completeForm != null || state.cancelOpen
                if (!sheetOpen) state.actionError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "info") { MeetingInfoCard(meeting) }
                if (meeting.hasOutcome()) item(key = "outcome") { MeetingOutcomeCard(meeting) }
            }
        }
    }
}

private fun MeetingAction.doneRes(): Int = when (this) {
    MeetingAction.COMPLETE -> R.string.meetings_done_completed
    MeetingAction.NO_SHOW -> R.string.meetings_done_no_show
    MeetingAction.CANCEL -> R.string.meetings_done_cancelled
}
