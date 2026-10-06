package com.schoolapp.feature.activities.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
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
import com.schoolapp.feature.activities.detail.components.ConsentsSummaryCard
import com.schoolapp.feature.activities.detail.components.ParentConsentCard
import com.schoolapp.feature.activities.detail.components.ParticipantsCard

@Composable
internal fun ActivityDetailScreen(
    state: ActivityDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onConsentNoteChange: (String) -> Unit,
    onDecideConsent: (ConsentStatus) -> Unit,
    onApprovalCommentChange: (String) -> Unit,
    onApprove: () -> Unit,
    onReject: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.activities_detail_title), navigationIcon = { BackButton(onBack) }) },
        bottomBar = {
            if (state.canApprove) {
                ApprovalBar(onApprove = onApprove, onReject = onReject, busyAction = state.busyApproval)
            }
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val activity = state.activity
        when {
            state.isLoading -> LoadingState(body)
            activity == null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), body, onRetry = onRetry)
            else -> ScreenColumn(body) {
                state.message?.let { item(key = "message") { InlineMessage(stringResource(it.textRes()), StatusTone.Success) } }
                state.actionError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "info") { ActivityInfoCard(activity, state.timeRange) }
                if (state.isParent && activity.consentRequired) {
                    item(key = "consent") { ParentConsentCard(state, onConsentNoteChange, onDecideConsent) }
                }
                if (state.canApprove) {
                    item(key = "comment") {
                        AppTextArea(
                            value = state.approvalComment,
                            onValueChange = onApprovalCommentChange,
                            label = stringResource(R.string.activities_approval_comment),
                            enabled = state.busyApproval == null,
                        )
                    }
                }
                if (!state.isParent) staffSections(state)
            }
        }
    }
}

private fun LazyListScope.staffSections(state: ActivityDetailUiState) {
    state.staffDataError?.let { item(key = "staff_error") { InlineMessage(appErrorMessage(it), StatusTone.Warning) } }
    if (state.activity?.consentRequired == true) {
        item(key = "consents_header") { SectionHeader(stringResource(R.string.activities_consents_title)) }
        item(key = "consents") { ConsentsSummaryCard(state.consents) }
    }
    if (state.participants.isNotEmpty()) {
        item(key = "participants_header") { SectionHeader(stringResource(R.string.activities_participants_title)) }
        item(key = "participants") { ParticipantsCard(state.participants) }
    }
}

private fun ActivityMessage.textRes(): Int = when (this) {
    ActivityMessage.CONSENT_SAVED -> R.string.activities_consent_saved
    ActivityMessage.APPROVED -> R.string.activities_approved_message
    ActivityMessage.REJECTED -> R.string.activities_rejected_message
}
