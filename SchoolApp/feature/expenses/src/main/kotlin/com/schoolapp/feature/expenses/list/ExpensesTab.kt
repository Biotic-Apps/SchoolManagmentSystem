package com.schoolapp.feature.expenses.list

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
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
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpenseStatus
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.common.FilterStatuses
import com.schoolapp.feature.expenses.common.statusLabel
import com.schoolapp.feature.expenses.list.components.ExpenseCard
import com.schoolapp.feature.expenses.list.components.ExpenseFilterSheet
import com.schoolapp.feature.expenses.list.components.ExpenseTotalsCard

internal class ExpenseListActions(
    val onRefresh: () -> Unit,
    val onLoadMore: () -> Unit,
    val onRetryMore: () -> Unit,
    val onStatus: (ExpenseStatus?) -> Unit,
    val onOpenFilters: () -> Unit,
    val onCloseFilters: () -> Unit,
    val onApplyFilters: (ExpenseFilters) -> Unit,
    val onOpen: (Expense) -> Unit,
)

/** "Bills and expenses" of the selected branch with status chips, filters, totals and paging. */
@Composable
internal fun ExpensesTab(state: ExpenseListUiState, actions: ExpenseListActions, bottomSpace: PaddingValues) {
    Column(Modifier.fillMaxSize()) {
        StatusChips(state.filters.status, actions.onStatus)
        when {
            state.isLoading -> LoadingState()
            state.error != null && state.items.isEmpty() -> ErrorState(loadErrorMessage(state.error), onRetry = actions.onRefresh)
            else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh) {
                ExpenseList(state, actions, bottomSpace)
            }
        }
    }
    if (state.showFilters) {
        ExpenseFilterSheet(
            filters = state.filters,
            categories = state.categories,
            onApply = actions.onApplyFilters,
            onDismiss = actions.onCloseFilters,
        )
    }
}

@Composable
private fun StatusChips(selected: ExpenseStatus?, onSelect: (ExpenseStatus?) -> Unit) {
    val options = listOf(SwitcherOption(ALL, stringResource(R.string.expenses_all))) +
        FilterStatuses.map { SwitcherOption(it.name, statusLabel(it)) }
    FilterChipRow(
        options = options,
        selectedId = selected?.name ?: ALL,
        onSelect = { id -> onSelect(FilterStatuses.firstOrNull { it.name == id }) },
        modifier = Modifier.fillMaxWidth().padding(start = 16.dp, top = 8.dp, end = 16.dp),
    )
}

@Composable
private fun ExpenseList(state: ExpenseListUiState, actions: ExpenseListActions, bottomSpace: PaddingValues) {
    ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 8.dp, end = 16.dp, bottom = 16.dp + bottomSpace.calculateBottomPadding())) {
        item(key = "header") {
            val count = state.filters.sheetCount
            SectionHeader(
                title = stringResource(R.string.expenses_list_title),
                action = {
                    AppTextButton(
                        text = if (count > 0) stringResource(R.string.expenses_filters_count, count) else stringResource(R.string.expenses_filters),
                        onClick = actions.onOpenFilters,
                        leadingIcon = Icons.Outlined.FilterList,
                    )
                },
            )
        }
        state.error?.let { error -> item(key = "error") { InlineMessage(loadErrorMessage(error), StatusTone.Error) } }
        if (state.items.isEmpty()) {
            item(key = "empty") {
                EmptyState(
                    title = stringResource(R.string.expenses_empty),
                    message = stringResource(R.string.expenses_empty_message),
                    icon = Icons.AutoMirrored.Outlined.ReceiptLong,
                )
            }
            return@ScreenColumn
        }
        item(key = "totals") {
            ExpenseTotalsCard(state.items.size, state.total, state.amountMinor, state.paidMinor, state.balanceMinor)
        }
        items(state.items.size, key = { state.items[it].id }) { index ->
            val expense = state.items[index]
            ExpenseCard(expense, state.categoryName(expense), onClick = { actions.onOpen(expense) })
        }
        if (state.hasMore) item(key = "more") { LoadMoreRow(state, actions) }
    }
}

@Composable
private fun LoadMoreRow(state: ExpenseListUiState, actions: ExpenseListActions) {
    val error = state.loadMoreError
    if (error != null) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(loadErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.expenses_retry), onClick = actions.onRetryMore)
        }
        return
    }
    LaunchedEffect(state.page) { actions.onLoadMore() }
    Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
}

private const val ALL = "ALL"
