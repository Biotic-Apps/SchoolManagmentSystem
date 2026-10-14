package com.schoolapp.feature.expenses.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.expenses.ExpensesRepository
import com.schoolapp.core.model.expenses.ExpenseQuery
import com.schoolapp.core.model.expenses.ExpenseStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Bills of one branch, filtered and paged (newest bill date first); totals cover the loaded rows. */
@HiltViewModel
class ExpenseListViewModel @Inject constructor(
    private val repository: ExpensesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ExpenseListUiState())
    val uiState: StateFlow<ExpenseListUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    /** Called whenever the selected branch changes; reloads list and categories. */
    fun setScope(branchId: String, schoolId: String?) {
        if (_uiState.value.branchId == branchId && this.schoolId == schoolId) return
        this.schoolId = schoolId
        _uiState.update { ExpenseListUiState(branchId = branchId, filters = ExpenseFilters()) }
        loadCategories()
        load(reset = true)
    }

    fun refresh() {
        if (_uiState.value.branchId == null) return
        loadCategories()
        load(reset = true)
    }

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || state.isLoading || state.loadMoreError != null) return
        load(reset = false)
    }

    fun retryMore() {
        _uiState.update { it.copy(loadMoreError = null) }
        loadMore()
    }

    fun setStatus(status: ExpenseStatus?) = applyFilters(_uiState.value.filters.copy(status = status))

    fun openFilters() = _uiState.update { it.copy(showFilters = true) }

    fun closeFilters() = _uiState.update { it.copy(showFilters = false) }

    fun applyFilters(filters: ExpenseFilters) {
        _uiState.update { it.copy(filters = filters, showFilters = false) }
        load(reset = true)
    }

    fun resetFilters() = applyFilters(ExpenseFilters())

    private fun loadCategories() {
        viewModelScope.launch {
            val result = repository.categories(schoolId)
            if (result is AppResult.Success) _uiState.update { it.copy(categories = result.data) }
        }
    }

    private fun load(reset: Boolean) {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        if (reset) loadJob?.cancel()
        val page = if (reset) 1 else state.page + 1
        _uiState.update {
            if (reset) {
                it.copy(isLoading = it.items.isEmpty(), isRefreshing = it.items.isNotEmpty(), isLoadingMore = false, error = null, loadMoreError = null)
            } else {
                it.copy(isLoadingMore = true, loadMoreError = null)
            }
        }
        val filters = state.filters
        val query = ExpenseQuery(branchId, filters.categoryId, filters.status, filters.from, filters.to)
        loadJob = viewModelScope.launch {
            val result = repository.expenses(query, page, PAGE_SIZE)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoading = false,
                        isRefreshing = false,
                        isLoadingMore = false,
                        items = if (reset) result.data.items else (current.items + result.data.items).distinctBy { it.id },
                        total = result.data.total,
                        page = page,
                        hasMore = result.data.hasMore,
                    )
                    is AppResult.Failure -> if (reset) {
                        current.copy(isLoading = false, isRefreshing = false, error = result.error)
                    } else {
                        current.copy(isLoadingMore = false, loadMoreError = result.error)
                    }
                }
            }
        }
    }

    private companion object {
        const val PAGE_SIZE = 30
    }
}
