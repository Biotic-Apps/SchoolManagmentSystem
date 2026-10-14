package com.schoolapp.feature.admin.schools.list

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.LoadMoreButton
import com.schoolapp.feature.admin.schools.components.SchoolRow

internal data class SchoolsListActions(
    val onQueryChange: (String) -> Unit,
    val onStatusChange: (String?) -> Unit,
    val onOpenSchool: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
    val onLoadMore: () -> Unit,
)

@Composable
internal fun SchoolsListScreen(state: SchoolsListUiState, actions: SchoolsListActions, modifier: Modifier = Modifier) {
    val bottom = if (state.canSetup) FAB_CLEARANCE else 16.dp
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottom), itemSpacing = 12.dp) {
            item(key = "search") {
                SearchField(state.query, actions.onQueryChange, placeholder = stringResource(R.string.schools_search_hint))
            }
            item(key = "status") { StatusFilter(state.status, actions.onStatusChange) }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null && state.schools.isEmpty() -> item(key = "error") {
                    ErrorState(loadErrorMessage(state.error), onRetry = actions.onRetry)
                }
                state.schools.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.schools_empty),
                        message = stringResource(if (state.isFiltered) R.string.schools_empty_filtered else R.string.schools_empty_message),
                        icon = Icons.Outlined.Apartment,
                    )
                }
                else -> {
                    items(state.schools, key = { it.id }) { school ->
                        SchoolRow(school, onClick = { actions.onOpenSchool(school.id) })
                    }
                    state.moreError?.let { error ->
                        item(key = "more_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) }
                    }
                    if (state.hasMore) {
                        item(key = "more") { LoadMoreButton(state.isLoadingMore, actions.onLoadMore, Modifier.padding(bottom = 8.dp)) }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusFilter(selected: String?, onSelect: (String?) -> Unit) {
    val options = listOf(
        SwitcherOption(ALL, stringResource(R.string.schools_filter_all)),
        SwitcherOption(School.STATUS_ACTIVE, stringResource(R.string.schools_status_active)),
        SwitcherOption(School.STATUS_ARCHIVED, stringResource(R.string.schools_status_archived)),
    )
    FilterChipRow(options, selected ?: ALL, onSelect = { onSelect(it.takeIf { id -> id != ALL }) })
}

private const val ALL = "ALL"

/** Keeps the last row clear of the "New school" button. */
private val FAB_CLEARANCE = 88.dp
