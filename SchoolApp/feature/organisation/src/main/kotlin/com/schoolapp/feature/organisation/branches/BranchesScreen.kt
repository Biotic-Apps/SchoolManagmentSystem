package com.schoolapp.feature.organisation.branches

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.branches.components.BranchOverviewContent
import com.schoolapp.feature.organisation.components.PullableState
import com.schoolapp.feature.organisation.components.RefreshErrorBanner
import com.schoolapp.feature.organisation.components.recordStatusTone
import com.schoolapp.feature.organisation.scope.ScopedPane

@Composable
fun BranchesScreen(
    state: BranchesUiState,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    onOpenBranch: (String) -> Unit,
    modifier: Modifier = Modifier,
    calendarContent: @Composable () -> Unit = {},
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.overview != null -> SingleBranchContent(state, onRefresh, calendarContent, modifier)
        else -> RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) {
            if (state.error != null && !state.hasContent) {
                PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            } else {
                BranchList(state, onOpenBranch)
            }
        }
    }
}

@Composable
private fun BranchList(state: BranchesUiState, onOpenBranch: (String) -> Unit) {
    ScopedPane {
        RefreshErrorBanner(state.error, Modifier.padding(start = 16.dp, top = 16.dp, end = 16.dp))
        DataList(
            items = state.branches,
            key = { it.id },
            modifier = Modifier.padding(16.dp),
            emptyContent = {
                PullableState {
                    EmptyState(title = stringResource(R.string.org_branches_empty), icon = Icons.Outlined.Apartment)
                }
            },
        ) { branch ->
            ListItemRow(
                title = branch.name,
                supporting = listOfNotNull(branch.schoolName, branch.code).joinToString(" · "),
                leadingIcon = Icons.Outlined.Apartment,
                onClick = { onOpenBranch(branch.id) },
                trailing = { branch.status?.let { StatusChip(humanizeKey(it), recordStatusTone(it)) } },
            )
        }
    }
}

/** One branch (principal): its details plus sessions and calendar, matching the "Branch & Calendar" menu entry. */
@Composable
private fun SingleBranchContent(
    state: BranchesUiState,
    onRefresh: () -> Unit,
    calendarContent: @Composable () -> Unit,
    modifier: Modifier = Modifier,
) {
    val overview = state.overview ?: return
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier) {
        AppTabs(
            titles = listOf(stringResource(R.string.org_tab_branch), stringResource(R.string.org_tab_calendar)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        if (tab == 0) {
            RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxSize()) {
                BranchOverviewContent(overview, refreshError = state.error)
            }
        } else {
            calendarContent()
        }
    }
}
