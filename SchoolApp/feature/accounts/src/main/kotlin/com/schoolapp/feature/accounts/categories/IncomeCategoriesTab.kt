package com.schoolapp.feature.accounts.categories

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Category
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.accounts.R

/** "Income categories for this school": name and code of each category. */
@Composable
internal fun IncomeCategoriesTab(state: IncomeCategoriesUiState, onRefresh: () -> Unit, bottomSpace: PaddingValues) {
    when {
        state.isLoading -> LoadingState()
        state.error != null && state.items.isEmpty() -> ErrorState(loadErrorMessage(state.error), onRetry = onRefresh)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {
            ScreenColumn(
                contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 16.dp + bottomSpace.calculateBottomPadding()),
                itemSpacing = 0.dp,
            ) {
                item(key = "header") {
                    SectionHeader(
                        title = stringResource(R.string.accounts_categories_title),
                        subtitle = stringResource(R.string.accounts_categories_count, state.items.size),
                    )
                }
                if (state.items.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.accounts_categories_empty),
                            message = stringResource(R.string.accounts_categories_empty_message),
                            icon = Icons.Outlined.Category,
                        )
                    }
                    return@ScreenColumn
                }
                dataListItems(items = state.items, key = { it.id }) { category ->
                    val code = category.code
                    ListItemRow(
                        title = category.name,
                        leadingIcon = Icons.Outlined.Category,
                        trailing = if (code == null) null else ({ StatusChip(code, StatusTone.Neutral) }),
                    )
                }
            }
        }
    }
}
