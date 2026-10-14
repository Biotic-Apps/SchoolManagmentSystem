package com.schoolapp.feature.attendance.review

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
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
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.feature.attendance.R

/** Principal / coordinator / head teacher / class teacher: leave requests to decide, and the ones already decided. */
@Composable
internal fun LeaveReviewRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LeaveReviewViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                stringResource(R.string.attendance_leave_requests),
                subtitle = stringResource(R.string.attendance_leave_requests_supporting),
                navigationIcon = { BackButton(onBack) },
            )
        },
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
                LeaveReviewContent(
                    state = state,
                    actions = LeaveReviewActions(
                        onRetry = viewModel::load,
                        onOpen = viewModel::onOpen,
                        onQuickDecide = viewModel::onQuickDecide,
                        onDecidedFilter = viewModel::onDecidedFilter,
                    ),
                )
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
