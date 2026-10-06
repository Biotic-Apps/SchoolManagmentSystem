package com.schoolapp.feature.activities.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Celebration
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
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.ActivityCard

@Composable
internal fun ActivitiesListScreen(
    state: ActivitiesListUiState,
    onTabSelected: (ActivitiesTab) -> Unit,
    onOpenActivity: (String) -> Unit,
    onPropose: () -> Unit,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {
            when {
                state.isLoading -> LoadingState()
                state.error != null && state.visible.isEmpty() && state.awaitingApproval.isEmpty() ->
                    ErrorState(appErrorMessage(state.error), onRetry = onRetry)
                state.noChild -> EmptyState(stringResource(R.string.activities_no_child), icon = Icons.Outlined.Celebration)
                else -> ActivitiesList(state, onTabSelected, onOpenActivity)
            }
        }
        if (state.canPropose) {
            AppFloatingButton(
                text = stringResource(R.string.activities_propose),
                icon = Icons.Outlined.Add,
                onClick = onPropose,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}

@Composable
private fun ActivitiesList(
    state: ActivitiesListUiState,
    onTabSelected: (ActivitiesTab) -> Unit,
    onOpenActivity: (String) -> Unit,
) {
    val bottom = if (state.canPropose) 88.dp else 16.dp
    ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottom)) {
        if (state.awaitingApproval.isNotEmpty()) {
            item(key = "awaiting_header") { SectionHeader(stringResource(R.string.activities_waiting_approval)) }
            items(state.awaitingApproval, key = { "awaiting_${it.activity.id}" }) { item ->
                ActivityCard(item, onClick = { onOpenActivity(item.activity.id) })
            }
        }
        item(key = "tabs") {
            AppTabs(
                titles = listOf(stringResource(R.string.activities_tab_upcoming), stringResource(R.string.activities_tab_past)),
                selectedIndex = state.tab.ordinal,
                onSelect = { onTabSelected(ActivitiesTab.entries[it]) },
            )
        }
        if (state.visible.isEmpty()) {
            item(key = "empty") {
                val title = if (state.tab == ActivitiesTab.UPCOMING) R.string.activities_empty_upcoming else R.string.activities_empty_past
                EmptyState(stringResource(title), icon = Icons.Outlined.Celebration)
            }
        } else {
            items(state.visible, key = { it.activity.id }) { item ->
                ActivityCard(item, onClick = { onOpenActivity(item.activity.id) })
            }
        }
    }
}
