package com.schoolapp.feature.approvals

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.approvals.components.ApprovalRow
import com.schoolapp.feature.approvals.components.CenteredPane
import com.schoolapp.feature.approvals.components.statusLabel

@Composable
fun ApprovalsScreen(
    state: ApprovalsUiState,
    onFilterSelected: (ApprovalStatus) -> Unit,
    onRefresh: () -> Unit,
    onOpen: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    CenteredPane(modifier) {
        Column(Modifier.fillMaxSize()) {
            FilterChipRow(
                options = ApprovalsUiState.Filters.map { SwitcherOption(it.name, statusLabel(it)) },
                selectedId = state.filter.name,
                onSelect = { onFilterSelected(ApprovalStatus.fromKey(it)) },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            )
            RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxSize()) {
                when {
                    state.isLoading -> LoadingState()
                    state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRefresh)
                    else -> DataList(
                        items = state.items,
                        key = { it.id },
                        modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 16.dp),
                        emptyContent = {
                            EmptyState(
                                title = stringResource(R.string.approvals_empty_title),
                                message = stringResource(R.string.approvals_empty_message),
                                icon = Icons.Outlined.TaskAlt,
                            )
                        },
                    ) { item -> ApprovalRow(item, onClick = { onOpen(item.id) }) }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ApprovalsScreenPreview() = SchoolTheme {
    ApprovalsScreen(
        state = ApprovalsUiState(
            isLoading = false,
            items = listOf(
                ApprovalRequest("1", "LEAVE", null, "Leave request: 2 days", "u2", "Bilal Ahmed", ApprovalStatus.PENDING, 1, "2026-10-04T09:00:00Z"),
            ),
        ),
        onFilterSelected = {}, onRefresh = {}, onOpen = {},
    )
}
