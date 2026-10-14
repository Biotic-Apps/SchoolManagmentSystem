package com.schoolapp.feature.complaints.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ReportProblem
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.ComplaintRow
import com.schoolapp.feature.complaints.list.components.ComplaintFilters
import com.schoolapp.feature.complaints.list.components.LoadMoreRow

internal class ComplaintsActions(
    val onTabSelected: (ComplaintBox) -> Unit,
    val onRefresh: () -> Unit,
    val onOpenComplaint: (Complaint) -> Unit,
    val onFile: () -> Unit,
    val onSearchChange: (String) -> Unit,
    val onStatus: (ComplaintStatus?) -> Unit,
    val onCategory: (ComplaintCategory?) -> Unit,
    val onClearFilters: () -> Unit,
    val onLoadMore: () -> Unit,
    val onRetryMore: () -> Unit,
)

@Composable
internal fun ComplaintsScreen(state: ComplaintsUiState, actions: ComplaintsActions, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            if (state.tabs.size > 1) {
                AppTabs(
                    titles = state.tabs.map { stringResource(it.titleRes()) },
                    selectedIndex = state.tabs.indexOf(state.box).coerceAtLeast(0),
                    onSelect = { actions.onTabSelected(state.tabs[it]) },
                )
            }
            RefreshBox(state.isRefreshing, actions.onRefresh, Modifier.fillMaxSize()) {
                ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                    item(key = "filters") {
                        ComplaintFilters(
                            search = state.search,
                            status = state.status,
                            category = state.category,
                            onSearchChange = actions.onSearchChange,
                            onStatus = actions.onStatus,
                            onCategory = actions.onCategory,
                        )
                    }
                    complaintItems(state, actions)
                }
            }
        }
        AppFloatingButton(
            text = stringResource(R.string.complaints_file),
            icon = Icons.Outlined.Add,
            onClick = actions.onFile,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        )
    }
}

private fun LazyListScope.complaintItems(state: ComplaintsUiState, actions: ComplaintsActions) {
    val rows = state.visibleItems
    when {
        state.isLoading -> item(key = "loading") { LoadingState() }
        state.error != null && state.items.isEmpty() -> item(key = "error") {
            ErrorState(appErrorMessage(state.error), onRetry = actions.onRefresh)
        }
        rows.isEmpty() && !state.hasMore -> item(key = "empty") {
            EmptyState(
                title = stringResource(R.string.complaints_empty_title),
                message = stringResource(if (state.isFiltered) R.string.complaints_empty_filtered else state.box.emptyRes()),
                icon = Icons.Outlined.ReportProblem,
                action = if (state.isFiltered) {
                    { AppTextButton(stringResource(R.string.complaints_clear_filters), onClick = actions.onClearFilters) }
                } else {
                    null
                },
            )
        }
        else -> {
            state.error?.let { error -> item(key = "stale") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            items(rows.size, key = { rows[it].id }) { index ->
                val complaint = rows[index]
                ComplaintRow(complaint, onClick = { actions.onOpenComplaint(complaint) })
            }
            if (state.hasMore) {
                item(key = "more") { LoadMoreRow(state.page, state.loadMoreError, actions.onLoadMore, actions.onRetryMore) }
            }
        }
    }
}

private fun ComplaintBox.titleRes(): Int = when (this) {
    ComplaintBox.MINE -> R.string.complaints_tab_mine
    ComplaintBox.ASSIGNED -> R.string.complaints_tab_assigned
    ComplaintBox.ALL -> R.string.complaints_tab_all
}

private fun ComplaintBox.emptyRes(): Int = when (this) {
    ComplaintBox.MINE -> R.string.complaints_empty_mine
    ComplaintBox.ASSIGNED -> R.string.complaints_empty_assigned
    ComplaintBox.ALL -> R.string.complaints_empty_all
}
