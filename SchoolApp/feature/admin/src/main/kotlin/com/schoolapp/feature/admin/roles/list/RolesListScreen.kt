package com.schoolapp.feature.admin.roles.list

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AdminPanelSettings
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.model.roles.Role
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admin.R

internal class RolesListCallbacks(
    val onQueryChange: (String) -> Unit,
    val onOpen: (Role) -> Unit,
    val onDelete: (Role) -> Unit,
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
)

@Composable
internal fun RolesListScreen(state: RolesListUiState, callbacks: RolesListCallbacks, bottomPadding: Dp, modifier: Modifier = Modifier) {
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = callbacks.onRefresh, modifier = modifier) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottomPadding), itemSpacing = 0.dp) {
            item(key = "header") {
                SectionHeader(
                    title = stringResource(R.string.roles_title),
                    subtitle = stringResource(R.string.roles_subtitle),
                    modifier = Modifier.padding(bottom = 12.dp),
                )
            }
            item(key = "search") {
                SearchField(state.query, callbacks.onQueryChange, Modifier.padding(bottom = 16.dp), placeholder = stringResource(R.string.roles_search_hint))
            }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = callbacks.onRetry) }
                else -> dataListItems(
                    items = state.visibleRoles,
                    key = { it.id },
                    emptyContent = {
                        EmptyState(
                            title = stringResource(R.string.roles_empty),
                            message = stringResource(if (state.query.isNotBlank()) R.string.roles_empty_search else R.string.roles_empty_hint),
                            icon = Icons.Outlined.AdminPanelSettings,
                        )
                    },
                ) { role ->
                    RoleRow(
                        role = role,
                        canEdit = role.id in state.editableIds,
                        onOpen = { callbacks.onOpen(role) },
                        onDelete = if (state.canDelete && role.isDeletable) ({ callbacks.onDelete(role) }) else null,
                    )
                }
            }
        }
    }
}
