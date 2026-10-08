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
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.branches.components.BranchOverviewContent
import com.schoolapp.feature.organisation.components.RefreshErrorBanner
import com.schoolapp.feature.organisation.components.recordStatusTone

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
        else -> RefreshBox(state.isRefreshing, onRefresh, modifier.fillMaxSize()) { BranchList(state, onRetry, onOpenBranch) }
    }
}

@Composable
private fun BranchList(state: BranchesUiState, onRetry: () -> Unit, onOpenBranch: (String) -> Unit) {
    ScreenColumn(itemSpacing = 0.dp) {
        if (state.error != null && !state.hasContent) {
            item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            return@ScreenColumn
        }
        if (state.error != null) item(key = "refresh-error") { RefreshErrorBanner(state.error, Modifier.padding(bottom = 16.dp)) }
        dataListItems(
            items = state.branches,
            key = { it.id },
            emptyContent = { EmptyState(title = stringResource(R.string.org_branches_empty), icon = Icons.Outlined.Apartment) },
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
