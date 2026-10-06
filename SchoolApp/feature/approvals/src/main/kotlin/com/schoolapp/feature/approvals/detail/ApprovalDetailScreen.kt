package com.schoolapp.feature.approvals.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.designsystem.component.ApprovalBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.approval.ApprovalStep
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.approvals.R
import com.schoolapp.feature.approvals.detail.components.ApprovalStepsCard
import com.schoolapp.feature.approvals.detail.components.ApprovalSummaryCard
import com.schoolapp.feature.approvals.detail.components.RequestDetailsCard
import com.schoolapp.feature.approvals.detail.components.decidedMessageRes

@Composable
fun ApprovalDetailScreen(
    state: ApprovalDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onCommentChange: (String) -> Unit,
    onDecide: (ApprovalDecision) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(title = stringResource(R.string.approvals_detail_title), navigationIcon = { BackButton(onBack) })
        },
        bottomBar = {
            if (state.showActions) {
                ApprovalBar(
                    onApprove = { onDecide(ApprovalDecision.APPROVED) },
                    onReject = { onDecide(ApprovalDecision.REJECTED) },
                    onReturn = { onDecide(ApprovalDecision.RETURNED) },
                    busyAction = state.busyDecision?.toAction(),
                )
            }
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val request = state.request
        when {
            request == null && state.loadError != null -> ErrorState(appErrorMessage(state.loadError), body, onRetry = onRetry)
            request == null -> LoadingState(body)
            else -> ScreenColumn(body) {
                state.decided?.let { item(key = "decided") { InlineMessage(stringResource(decidedMessageRes(it)), StatusTone.Success) } }
                state.decideError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "summary") { ApprovalSummaryCard(request) }
                if (request.details.isNotEmpty()) item(key = "details") { RequestDetailsCard(request.type, request.details) }
                if (request.steps.isNotEmpty()) item(key = "steps") { ApprovalStepsCard(request.steps) }
                if (state.showActions) {
                    item(key = "comment") {
                        AppTextArea(
                            value = state.comment,
                            onValueChange = onCommentChange,
                            label = stringResource(R.string.approvals_comment),
                            errorText = if (state.commentRequired) stringResource(R.string.approvals_comment_required) else null,
                            supportingText = stringResource(R.string.approvals_comment_hint),
                            enabled = state.busyDecision == null,
                        )
                    }
                }
            }
        }
    }
}

private fun ApprovalDecision.toAction() = when (this) {
    ApprovalDecision.APPROVED -> ApprovalAction.Approve
    ApprovalDecision.REJECTED -> ApprovalAction.Reject
    ApprovalDecision.RETURNED -> ApprovalAction.Return
}

@Preview(showBackground = true)
@Composable
private fun ApprovalDetailScreenPreview() = SchoolTheme {
    ApprovalDetailScreen(
        state = ApprovalDetailUiState(
            isLoading = false,
            canDecide = true,
            request = ApprovalRequest(
                "1", "LEAVE", "LeaveRequest", "Leave request: 2 days", "u2", "Bilal Ahmed",
                ApprovalStatus.PENDING, 1, "2026-10-04T09:00:00Z",
                steps = listOf(ApprovalStep(1, "PRINCIPAL", null, null, null, null)),
            ),
        ),
        onBack = {}, onRetry = {}, onCommentChange = {}, onDecide = {},
    )
}
