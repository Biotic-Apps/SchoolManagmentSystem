package com.schoolapp.feature.attendance.review

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.LeaveRequestCard

@Composable
internal fun LeaveReviewRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LeaveReviewViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(stringResource(R.string.attendance_leave_requests), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            AppTabs(
                titles = listOf(
                    stringResource(R.string.attendance_tab_pending_count, state.pending.size),
                    stringResource(R.string.attendance_tab_decided),
                ),
                selectedIndex = state.tab.ordinal,
                onSelect = { viewModel.onTabSelected(ReviewTab.entries[it]) },
            )
            RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
                LeaveReviewContent(state, viewModel::load, viewModel::onOpen)
            }
        }
    }
    state.decision?.let { decision ->
        LeaveDecisionSheet(
            decision = decision,
            onCommentChange = viewModel::onCommentChange,
            onApprove = viewModel::approve,
            onReject = viewModel::reject,
            onDismiss = viewModel::onDismissDecision,
        )
    }
}

@Composable
internal fun LeaveReviewContent(state: LeaveReviewUiState, onRetry: () -> Unit, onOpen: (String) -> Unit, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.pending.isEmpty() && state.decided.isEmpty() -> PullableState(modifier) { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
        else -> ScreenColumn(modifier) {
            state.error?.let { item(key = "refresh_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            state.message?.let { message ->
                item(key = "message") {
                    val text = if (message == ReviewMessage.APPROVED) R.string.attendance_leave_approved_message else R.string.attendance_leave_rejected_message
                    InlineMessage(stringResource(text), StatusTone.Success)
                }
            }
            if (state.items.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(
                            if (state.tab == ReviewTab.PENDING) R.string.attendance_review_empty_pending else R.string.attendance_review_empty_decided,
                        ),
                        icon = Icons.Outlined.EventAvailable,
                    )
                }
            }
            val pending = state.tab == ReviewTab.PENDING
            items(state.items, key = { it.id }) { leave ->
                LeaveRequestCard(leave = leave, showSubject = true, onClick = if (pending) ({ onOpen(leave.id) }) else null)
            }
        }
    }
}
