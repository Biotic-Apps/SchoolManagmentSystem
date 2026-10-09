package com.schoolapp.feature.meetings.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.feature.meetings.R

@Composable
internal fun MeetingDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MeetingDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    MeetingDetailScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onComplete = viewModel::openComplete,
        onCancel = viewModel::openCancel,
        onNoShow = viewModel::askNoShow,
        onAccept = viewModel::accept,
        onDecline = viewModel::openDecline,
        modifier = modifier,
    )
    val completeActions = remember(viewModel) {
        CompleteSheetActions(
            onNotes = viewModel::onNotesChange,
            onShareSummary = viewModel::onShareSummaryChange,
            onSummary = viewModel::onSummaryChange,
            onAddFollowUp = viewModel::addFollowUp,
            onRemoveFollowUp = viewModel::removeFollowUp,
            onFollowUpTitle = viewModel::onFollowUpTitleChange,
            onFollowUpDate = viewModel::onFollowUpDateChange,
            onSubmit = viewModel::submitComplete,
            onDismiss = viewModel::dismissComplete,
        )
    }
    state.completeForm?.let { form ->
        CompleteMeetingSheet(form, state.completeErrors, busy = state.busy == MeetingAction.COMPLETE, error = state.actionError, actions = completeActions)
    }
    if (state.cancelOpen) {
        CancelMeetingSheet(
            reason = state.cancelReason,
            busy = state.busy == MeetingAction.CANCEL || state.busy == MeetingAction.DECLINE,
            declining = state.declining,
            error = state.actionError,
            onReasonChange = viewModel::onCancelReasonChange,
            onSubmit = viewModel::submitCancel,
            onDismiss = viewModel::dismissCancel,
        )
    }
    if (state.confirmNoShow) {
        ConfirmDialog(
            title = stringResource(R.string.meetings_no_show_title),
            message = stringResource(R.string.meetings_no_show_message),
            confirmLabel = stringResource(R.string.meetings_no_show),
            onConfirm = viewModel::confirmNoShow,
            onDismiss = viewModel::dismissNoShow,
            destructive = true,
        )
    }
}
