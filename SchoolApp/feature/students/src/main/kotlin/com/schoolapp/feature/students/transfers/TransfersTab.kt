package com.schoolapp.feature.students.transfers

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SwapHoriz
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
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.paging.LoadMoreOnScroll
import com.schoolapp.feature.students.paging.pagedItems

/** Transfers between branches: filters, paged rows with accept / reject / cancel, and their sheets. */
@Composable
fun TransfersTab(modifier: Modifier = Modifier, viewModel: TransfersViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val paged by viewModel.transfers.state.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()
    val snackbar = remember { SnackbarHostState() }
    val noticeText = state.notice?.let {
        stringResource(
            when (it) {
                TransferNotice.ACCEPTED -> R.string.students_transfer_accepted
                TransferNotice.REJECTED -> R.string.students_transfer_rejected
                TransferNotice.CANCELLED -> R.string.students_transfer_cancelled
            },
        )
    }
    LaunchedEffect(state.notice) {
        if (noticeText != null) {
            viewModel.noticeShown()
            snackbar.showSnackbar(noticeText)
        }
    }
    LoadMoreOnScroll(listState, viewModel.transfers::loadMore)
    Box(modifier.fillMaxSize()) {
        RefreshBox(paged.isRefreshing, viewModel.transfers::refresh) {
            ScreenColumn(itemSpacing = 0.dp, state = listState) {
                item(key = "filters") {
                    TransferFilters(state.filter, viewModel::onDirection, viewModel::onStatus, Modifier.padding(bottom = 16.dp))
                }
                if (state.scopeError != null) {
                    item(key = "scope_error") { ErrorState(appErrorMessage(state.scopeError!!), onRetry = viewModel::loadScope) }
                } else {
                    pagedItems(
                        paged = paged,
                        key = { it.id },
                        onRetry = { viewModel.transfers.reload() },
                        onLoadMore = viewModel.transfers::loadMore,
                        empty = {
                            EmptyState(
                                stringResource(R.string.students_transfers_empty),
                                message = stringResource(R.string.students_transfers_empty_hint),
                                icon = Icons.Outlined.SwapHoriz,
                            )
                        },
                    ) { transfer ->
                        TransferRow(
                            transfer = transfer,
                            incoming = viewModel.isIncoming(transfer),
                            canDecide = state.canDecide,
                            onAccept = { viewModel.openAccept(transfer) },
                            onReject = { viewModel.openClose(transfer, CloseAction.REJECT) },
                            onCancel = { viewModel.openClose(transfer, CloseAction.CANCEL) },
                        )
                    }
                }
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
    state.sheet?.let { TransferSheetHost(it, state.sections, viewModel) }
}
