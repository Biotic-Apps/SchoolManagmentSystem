package com.schoolapp.feature.complaints.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
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
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.ComplaintRow

@Composable
internal fun ComplaintsScreen(
    state: ComplaintsUiState,
    onTabSelected: (ComplaintBox) -> Unit,
    onRefresh: () -> Unit,
    onOpenComplaint: (Complaint) -> Unit,
    onFile: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            if (state.tabs.size > 1) {
                AppTabs(
                    titles = state.tabs.map { stringResource(it.titleRes()) },
                    selectedIndex = state.tabs.indexOf(state.box).coerceAtLeast(0),
                    onSelect = { onTabSelected(state.tabs[it]) },
                )
            }
            RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxSize()) {
                when {
                    state.isLoading -> LoadingState()
                    state.error != null && state.items.isEmpty() -> ErrorState(appErrorMessage(state.error), onRetry = onRefresh)
                    state.items.isEmpty() -> EmptyState(
                        title = stringResource(R.string.complaints_empty_title),
                        message = stringResource(state.box.emptyRes()),
                        icon = Icons.Outlined.ReportProblem,
                    )
                    else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                        items(state.items.size, key = { state.items[it].id }) { index ->
                            val complaint = state.items[index]
                            ComplaintRow(complaint, onClick = { onOpenComplaint(complaint) })
                        }
                    }
                }
            }
        }
        AppFloatingButton(
            text = stringResource(R.string.complaints_file),
            icon = Icons.Outlined.Add,
            onClick = onFile,
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        )
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
