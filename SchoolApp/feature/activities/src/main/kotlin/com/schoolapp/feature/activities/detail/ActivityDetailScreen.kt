package com.schoolapp.feature.activities.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.ApprovalBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.detail.components.ActivityInfoCard
import com.schoolapp.feature.activities.detail.components.CancelActivitySheet
import com.schoolapp.feature.activities.detail.components.ConsentsSummaryCard
import com.schoolapp.feature.activities.detail.components.ParentConsentCard
import com.schoolapp.feature.activities.detail.components.ParticipantsCard
import com.schoolapp.feature.activities.detail.components.StaffActionsCard

/** Callbacks of the detail screen. */
internal class ActivityDetailActions(
    val onBack: () -> Unit,
    val onRetry: () -> Unit,
    val onConsentNoteChange: (String) -> Unit,
    val onDecideConsent: (ConsentStatus) -> Unit,
    val onApprovalCommentChange: (String) -> Unit,
    val onApprove: () -> Unit,
    val onReject: () -> Unit,
    val onEdit: () -> Unit,
    val onEditParticipants: () -> Unit,
    val status: ActivityStatusController,
)

@Composable
internal fun ActivityDetailScreen(state: ActivityDetailUiState, actions: ActivityDetailActions, modifier: Modifier = Modifier) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.activities_detail_title), navigationIcon = { BackButton(actions.onBack) }) },
        bottomBar = {
            if (state.canApprove) {
                ApprovalBar(onApprove = actions.onApprove, onReject = actions.onReject, busyAction = state.busyApproval)
            }
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val activity = state.activity
        when {
            state.isLoading -> LoadingState(body)
            activity == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), body, onRetry = actions.onRetry)
            else -> ScreenColumn(body) {
                state.message?.let { item(key = "message") { InlineMessage(stringResource(it.textRes()), StatusTone.Success) } }
                state.actionError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "info") { ActivityInfoCard(activity, state.timeRange) }
                if (state.isParent && activity.consentRequired) {
                    item(key = "consent") { ParentConsentCard(state, actions.onConsentNoteChange, actions.onDecideConsent) }
                }
                if (state.canApprove) {
                    item(key = "comment") {
                        AppTextArea(
                            value = state.approvalComment,
                            onValueChange = actions.onApprovalCommentChange,
                            label = stringResource(R.string.activities_approval_comment),
                            enabled = state.busyApproval == null,
                        )
                    }
                }
                if (!state.isParent && state.actions.any) {
                    item(key = "actions") {
                        StaffActionsCard(
                            actions = state.actions,
                            onEdit = actions.onEdit,
                            onStart = actions.status::start,
                            onComplete = actions.status::complete,
                            onCancel = actions.status::openCancel,
                        )
                    }
                }
                if (!state.isParent) staffSections(state, actions.onEditParticipants)
            }
        }
    }
    CancelActivitySheet(
        actions = state.actions,
        onReasonChange = actions.status::onCancelReasonChange,
        onConfirm = actions.status::confirmCancel,
        onDismiss = actions.status::dismissCancel,
    )
}

private fun LazyListScope.staffSections(state: ActivityDetailUiState, onEditParticipants: () -> Unit) {
    state.staffDataError?.let { item(key = "staff_error") { InlineMessage(appErrorMessage(it), StatusTone.Warning) } }
    if (state.activity?.consentRequired == true) {
        item(key = "consents_header") { SectionHeader(stringResource(R.string.activities_consents_title)) }
        item(key = "consents") { ConsentsSummaryCard(state.consents) }
    }
    val canEdit = state.actions.canEditParticipants
    if (state.participants.isNotEmpty() || canEdit) {
        item(key = "participants_header") {
            SectionHeader(
                title = stringResource(R.string.activities_participants_title),
                action = if (canEdit) {
                    { AppTextButton(stringResource(R.string.activities_participants_edit), onClick = onEditParticipants, leadingIcon = Icons.Outlined.Groups) }
                } else {
                    null
                },
            )
        }
        if (state.participants.isEmpty()) {
            item(key = "participants_empty") { InlineMessage(stringResource(R.string.activities_participants_empty), StatusTone.Info) }
        } else {
            item(key = "participants") { ParticipantsCard(state.participants) }
        }
    }
}

private fun ActivityMessage.textRes(): Int = when (this) {
    ActivityMessage.CONSENT_SAVED -> R.string.activities_consent_saved
    ActivityMessage.APPROVED -> R.string.activities_approved_message
    ActivityMessage.REJECTED -> R.string.activities_rejected_message
    ActivityMessage.STARTED -> R.string.activities_started_message
    ActivityMessage.COMPLETED -> R.string.activities_completed_message
    ActivityMessage.CANCELLED -> R.string.activities_cancelled_message
}
