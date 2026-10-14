package com.schoolapp.feature.expenses.list

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpenseCategory
import com.schoolapp.core.model.expenses.ExpenseStatus

/** List filters; null means "any". Dates are `YYYY-MM-DD` bill dates (inclusive). */
data class ExpenseFilters(
    val categoryId: String? = null,
    val status: ExpenseStatus? = null,
    val from: String? = null,
    val to: String? = null,
) {
    /** Filters set in the sheet (status has its own chip row). */
    val sheetCount: Int get() = listOfNotNull(categoryId, from, to).size
}

data class ExpenseListUiState(
    val branchId: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: AppError? = null,
    val loadMoreError: AppError? = null,
    val filters: ExpenseFilters = ExpenseFilters(),
    val items: List<Expense> = emptyList(),
    val total: Int = 0,
    val page: Int = 0,
    val hasMore: Boolean = false,
    val categories: List<ExpenseCategory> = emptyList(),
    val showFilters: Boolean = false,
) {
    val amountMinor: Long get() = items.sumOf { it.amountMinor }
    val paidMinor: Long get() = items.sumOf { it.paidMinor }
    val balanceMinor: Long get() = items.sumOf { it.balanceMinor }

    fun categoryName(expense: Expense): String? =
        expense.categoryName ?: categories.firstOrNull { it.id == expense.categoryId }?.name
}
