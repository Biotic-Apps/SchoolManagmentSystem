package com.schoolapp.feature.organisation.branches

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.model.organisation.BranchOverview
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.branches.components.BranchOverviewContent
import com.schoolapp.feature.organisation.components.recordStatusTone
import com.schoolapp.feature.organisation.scope.ScopedPane
import com.schoolapp.core.ui.humanizeKey

@Composable
fun BranchesScreen(
    state: BranchesUiState,
    onRetry: () -> Unit,
    onOpenBranch: (String) -> Unit,
    modifier: Modifier = Modifier,
    calendarContent: @Composable () -> Unit = {},
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        state.overview != null -> SingleBranchContent(state.overview, calendarContent, modifier)
        else -> ScopedPane(modifier) {
            DataList(
                items = state.branches,
                key = { it.id },
                modifier = Modifier.padding(16.dp),
                emptyContent = {
                    EmptyState(title = stringResource(R.string.org_branches_empty), icon = Icons.Outlined.Apartment)
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
}

/** One branch (principal): its details plus sessions and calendar, matching the "Branch & Calendar" menu entry. */
@Composable
private fun SingleBranchContent(
    overview: BranchOverview,
    calendarContent: @Composable () -> Unit,
    modifier: Modifier = Modifier,
) {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier) {
        AppTabs(
            titles = listOf(stringResource(R.string.org_tab_branch), stringResource(R.string.org_tab_calendar)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        if (tab == 0) BranchOverviewContent(overview) else calendarContent()
    }
}
