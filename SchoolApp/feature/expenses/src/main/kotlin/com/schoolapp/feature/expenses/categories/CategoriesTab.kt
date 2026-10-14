package com.schoolapp.feature.expenses.categories

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Category
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.expenses.R

/** Categories group expenses (rent, utilities, repairs) for every branch of the school. */
@Composable
internal fun CategoriesTab(state: CategoriesUiState, onRefresh: () -> Unit, bottomSpace: PaddingValues) {
    when {
        state.isLoading -> LoadingState()
        state.error != null && state.items.isEmpty() -> ErrorState(loadErrorMessage(state.error), onRetry = onRefresh)
        state.items.isEmpty() -> EmptyState(
            title = stringResource(R.string.expenses_categories_empty),
            message = stringResource(R.string.expenses_categories_empty_message),
            icon = Icons.Outlined.Category,
        )
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = onRefresh) {
            ScreenColumn(
                contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 16.dp + bottomSpace.calculateBottomPadding()),
                itemSpacing = 12.dp,
            ) {
                item(key = "header") { SectionHeader(title = stringResource(R.string.expenses_categories_title)) }
                state.error?.let { error -> item(key = "error") { InlineMessage(loadErrorMessage(error), StatusTone.Error) } }
                item(key = "list") {
                    AppCard(contentPadding = 4.dp) {
                        state.items.forEach { category ->
                            ListItemRow(
                                title = category.name,
                                leadingIcon = Icons.Outlined.Category,
                                trailing = category.code?.let { code -> @Composable { StatusChip(code, StatusTone.Neutral) } },
                            )
                        }
                    }
                }
            }
        }
    }
}
