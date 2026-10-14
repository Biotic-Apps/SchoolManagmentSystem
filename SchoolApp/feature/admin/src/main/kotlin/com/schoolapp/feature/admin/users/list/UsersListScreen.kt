package com.schoolapp.feature.admin.users.list

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ManageAccounts
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.users.AdminUser
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.FilterPickerChip
import com.schoolapp.feature.admin.common.LoadMoreButton
import com.schoolapp.feature.admin.users.components.UserRow
import com.schoolapp.feature.admin.users.components.roleKeyLabel
import com.schoolapp.feature.admin.users.components.userStatusLabel

internal data class UsersListActions(
    val onQueryChange: (String) -> Unit,
    val onRoleChange: (String?) -> Unit,
    val onBranchChange: (String?) -> Unit,
    val onStatusChange: (String?) -> Unit,
    val onReset: () -> Unit,
    val onOpenUser: (String) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
    val onLoadMore: () -> Unit,
)

@Composable
internal fun UsersListScreen(state: UsersListUiState, actions: UsersListActions, modifier: Modifier = Modifier) {
    val bottom = if (state.canAdd) FAB_CLEARANCE else 16.dp
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottom), itemSpacing = 12.dp) {
            item(key = "search") {
                SearchField(state.query, actions.onQueryChange, placeholder = stringResource(R.string.users_search_hint))
            }
            item(key = "filters") { UserFilters(state, actions) }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null && state.users.isEmpty() -> item(key = "error") {
                    ErrorState(loadErrorMessage(state.error), onRetry = actions.onRetry)
                }
                state.users.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.users_empty),
                        message = stringResource(R.string.users_empty_message),
                        icon = Icons.Outlined.ManageAccounts,
                    )
                }
                else -> {
                    items(state.users, key = { it.id }) { user -> UserRow(user, onClick = { actions.onOpenUser(user.id) }) }
                    state.moreError?.let { error -> item(key = "more_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                    if (state.hasMore) {
                        item(key = "more") { LoadMoreButton(state.isLoadingMore, actions.onLoadMore, Modifier.padding(bottom = 8.dp)) }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun UserFilters(state: UsersListUiState, actions: UsersListActions) {
    val roles = RoleKey.entries.filter { it != RoleKey.PARENT }.map { SwitcherOption(it.key, roleKeyLabel(it.key)) }
    val statuses = listOf(AdminUser.STATUS_ACTIVE, AdminUser.STATUS_DISABLED).map { SwitcherOption(it, userStatusLabel(it)) }
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        FilterPickerChip(
            label = stringResource(R.string.users_filter_role),
            allLabel = stringResource(R.string.users_filter_all_roles),
            options = roles,
            selectedId = state.role,
            onSelect = actions.onRoleChange,
        )
        if (state.branches.isNotEmpty()) {
            FilterPickerChip(
                label = stringResource(R.string.users_filter_branch),
                allLabel = stringResource(R.string.users_filter_all_branches),
                options = state.branches.map { SwitcherOption(it.id, it.name) },
                selectedId = state.branchId,
                onSelect = actions.onBranchChange,
            )
        }
        FilterPickerChip(
            label = stringResource(R.string.users_filter_status),
            allLabel = stringResource(R.string.users_filter_all_statuses),
            options = statuses,
            selectedId = state.status,
            onSelect = actions.onStatusChange,
        )
        if (state.isFiltered) AppTextButton(stringResource(R.string.users_filter_reset), actions.onReset)
    }
}

/** Keeps the last row clear of the "Add user" button. */
private val FAB_CLEARANCE = 88.dp
