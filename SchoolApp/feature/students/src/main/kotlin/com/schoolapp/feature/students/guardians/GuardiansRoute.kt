package com.schoolapp.feature.students.guardians

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.CenteredColumn
import com.schoolapp.feature.students.loginslips.LoginSlipsSheet

/**
 * Parents & Guardians (web GuardiansPage): link requests approved/rejected in place, the guardian directory
 * (rows open the guardian) and, for `guardians.edit` + `users.edit`, bulk parent login slips.
 * [onOpenApprovals] is kept for callers; requests are now decided here.
 */
@Suppress("UNUSED_PARAMETER")
@Composable
fun GuardiansRoute(
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    onOpenGuardian: (String) -> Unit = {},
    viewModel: GuardiansViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val requests by viewModel.requests.state.collectAsStateWithLifecycle()
    val guardians by viewModel.guardians.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val noticeText = state.notice?.let {
        stringResource(if (it == GuardiansNotice.APPROVED) R.string.students_link_approved else R.string.students_link_rejected)
    }
    LaunchedEffect(state.notice) {
        if (noticeText != null) {
            viewModel.noticeShown()
            snackbar.showSnackbar(noticeText)
        }
    }
    Box(modifier.fillMaxSize()) {
        CenteredColumn {
            AppTabs(
                titles = listOf(stringResource(R.string.students_tab_link_requests), stringResource(R.string.students_tab_guardians)),
                selectedIndex = state.tab.ordinal,
                onSelect = { viewModel.onTabSelected(GuardiansTab.entries[it]) },
            )
            when (state.tab) {
                GuardiansTab.LINK_REQUESTS -> LinkRequestsList(
                    state = state,
                    paged = requests,
                    onRefresh = viewModel::refresh,
                    onRetry = { viewModel.requests.reload() },
                    onLoadMore = viewModel.requests::loadMore,
                    onApprove = viewModel::approve,
                    onReject = viewModel::startReject,
                    onDismissError = viewModel::dismissError,
                )
                GuardiansTab.GUARDIANS -> GuardianDirectoryList(
                    state = state,
                    paged = guardians,
                    onQueryChange = viewModel::onQueryChange,
                    onRefresh = viewModel::refresh,
                    onRetry = { viewModel.guardians.reload() },
                    onLoadMore = viewModel.guardians::loadMore,
                    onOpenGuardian = onOpenGuardian,
                    onPrintSlips = { viewModel.showLoginSlips(true) },
                )
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
    state.rejecting?.let { request ->
        RejectLinkSheet(
            request = request,
            reason = state.rejectReason,
            saving = request.id in state.deciding,
            error = state.actionError,
            onReason = viewModel::onRejectReason,
            onConfirm = viewModel::confirmReject,
            onDismiss = viewModel::dismissReject,
        )
    }
    if (state.showLoginSlips) LoginSlipsSheet(onDismiss = { viewModel.showLoginSlips(false) })
}
