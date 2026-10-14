package com.schoolapp.feature.accounts.income

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material.icons.outlined.Savings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.accounts.R
import com.schoolapp.feature.accounts.income.components.IncomeCard

internal class IncomeListActions(
    val onRefresh: () -> Unit,
    val onLoadMore: () -> Unit,
    val onOpenFilters: () -> Unit,
    val onOpen: (Income) -> Unit,
)

/** "Other income" of the branch: filter button, loaded total, cards and endless paging. */
@Composable
internal fun IncomeTab(
    state: IncomeListUiState,
    categoryName: (Income) -> String?,
    actions: IncomeListActions,
    bottomSpace: PaddingValues,
) {
    when {
        state.isLoading && state.items.isEmpty() -> LoadingState()
        state.error != null && state.items.isEmpty() -> ErrorState(loadErrorMessage(state.error), onRetry = actions.onRefresh)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh) {
            ScreenColumn(
                contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 16.dp + bottomSpace.calculateBottomPadding()),
                itemSpacing = 12.dp,
            ) {
                item(key = "header") { Header(state, actions.onOpenFilters) }
                state.error?.let { error -> item(key = "error") { InlineMessage(loadErrorMessage(error), StatusTone.Error) } }
                state.actionError?.takeIf { state.selected == null }?.let { error ->
                    item(key = "action_error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) }
                }
                if (state.items.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            title = stringResource(if (state.filter.isActive) R.string.accounts_income_none_match else R.string.accounts_income_empty),
                            message = stringResource(R.string.accounts_income_empty_message),
                            icon = Icons.Outlined.Savings,
                        )
                    }
                    return@ScreenColumn
                }
                item(key = "total") {
                    MoneyRow(
                        label = stringResource(R.string.accounts_loaded_total),
                        amountMinor = state.loadedAmountMinor,
                        supporting = stringResource(R.string.accounts_records_count, state.items.size, state.total ?: state.items.size),
                        emphasized = true,
                    )
                }
                items(state.items.size, key = { state.items[it].id }) { index ->
                    val income = state.items[index]
                    IncomeCard(income, categoryName(income), onClick = { actions.onOpen(income) })
                }
                if (state.hasMore) item(key = "more") { LoadMoreRow(state, actions) }
            }
        }
    }
}

@Composable
private fun Header(state: IncomeListUiState, onOpenFilters: () -> Unit) {
    val count = listOfNotNull(state.filter.categoryId, state.filter.from ?: state.filter.to).size
    SectionHeader(
        title = stringResource(R.string.accounts_income_title),
        action = {
            AppTextButton(
                text = if (count > 0) stringResource(R.string.accounts_filters_count, count) else stringResource(R.string.accounts_filters),
                onClick = onOpenFilters,
                leadingIcon = Icons.Outlined.FilterList,
            )
        },
    )
}

@Composable
private fun LoadMoreRow(state: IncomeListUiState, actions: IncomeListActions) {
    val error = state.loadMoreError
    if (error != null) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(loadErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.accounts_retry), onClick = actions.onLoadMore)
        }
        return
    }
    LaunchedEffect(state.page) { actions.onLoadMore() }
    Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
}
