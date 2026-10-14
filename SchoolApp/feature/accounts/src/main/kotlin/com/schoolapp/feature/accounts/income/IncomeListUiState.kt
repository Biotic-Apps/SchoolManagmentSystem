package com.schoolapp.feature.accounts.income

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeFilter

/** Snackbar after an income change. */
enum class IncomeChange { RECORDED, UPDATED, DELETED }

data class IncomeListUiState(
    val branchId: String? = null,
    val filter: IncomeFilter = IncomeFilter(),
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val items: List<Income> = emptyList(),
    val page: Int = 0,
    val total: Int? = null,
    val isLoadingMore: Boolean = false,
    val loadMoreError: AppError? = null,
    val showFilters: Boolean = false,
    val selected: Income? = null,
    val confirmDelete: Income? = null,
    val deletingId: String? = null,
    val actionError: AppError? = null,
    val change: IncomeChange? = null,
) {
    val hasMore: Boolean get() = total != null && items.size < total

    /** Sum of the records loaded so far (all of them once [hasMore] is false). */
    val loadedAmountMinor: Long get() = items.sumOf { it.amountMinor }
}
