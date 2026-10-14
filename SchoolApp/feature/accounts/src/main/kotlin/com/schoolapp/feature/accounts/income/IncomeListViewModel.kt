package com.schoolapp.feature.accounts.income

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.accounts.AccountsRepository
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeFilter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** "Other income" of the selected branch: filters, paging, detail and delete. */
@HiltViewModel
class IncomeListViewModel @Inject constructor(
    private val repository: AccountsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(IncomeListUiState())
    val uiState: StateFlow<IncomeListUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    fun setBranch(branchId: String) {
        if (_uiState.value.branchId == branchId) return
        loadJob?.cancel()
        _uiState.update { IncomeListUiState(branchId = branchId, filter = it.filter) }
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun openFilters() = _uiState.update { it.copy(showFilters = true) }

    fun closeFilters() = _uiState.update { it.copy(showFilters = false) }

    fun applyFilter(filter: IncomeFilter) {
        _uiState.update { it.copy(filter = filter, showFilters = false, items = emptyList(), page = 0, total = null) }
        load(refreshing = false)
    }

    fun loadMore() {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        if (!state.hasMore || state.isLoadingMore || state.isLoading) return
        _uiState.update { it.copy(isLoadingMore = true, loadMoreError = null) }
        val next = state.page + 1
        loadJob = viewModelScope.launch {
            val result = repository.income(branchId, state.filter, next)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoadingMore = false,
                        items = (current.items + result.data.items).distinctBy { it.id },
                        page = next,
                        total = result.data.total,
                    )
                    is AppResult.Failure -> current.copy(isLoadingMore = false, loadMoreError = result.error)
                }
            }
        }
    }

    fun open(income: Income) = _uiState.update { it.copy(selected = income, actionError = null) }

    fun closeDetail() = _uiState.update { it.copy(selected = null) }

    fun askDelete(income: Income) = _uiState.update { it.copy(confirmDelete = income) }

    fun dismissDelete() = _uiState.update { it.copy(confirmDelete = null) }

    fun confirmDelete() {
        val income = _uiState.value.confirmDelete ?: return
        if (_uiState.value.deletingId != null) return
        _uiState.update { it.copy(confirmDelete = null, deletingId = income.id, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.deleteIncome(income.id)) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(
                        deletingId = null,
                        selected = null,
                        items = state.items.filterNot { it.id == income.id },
                        total = state.total?.minus(1)?.coerceAtLeast(0),
                        change = IncomeChange.DELETED,
                    )
                }
                is AppResult.Failure -> _uiState.update { it.copy(deletingId = null, actionError = result.error) }
            }
        }
    }

    /** After the form saved: show the change and reload page 1 so the record lands in order. */
    fun onSaved(change: IncomeChange) {
        _uiState.update { it.copy(selected = null, change = change) }
        load(refreshing = true)
    }

    fun consumeChange() = _uiState.update { it.copy(change = null) }

    private fun load(refreshing: Boolean) {
        val branchId = _uiState.value.branchId ?: return
        val filter = _uiState.value.filter
        loadJob?.cancel()
        _uiState.update {
            it.copy(isLoading = !refreshing || it.items.isEmpty(), isRefreshing = refreshing, error = null, loadMoreError = null)
        }
        loadJob = viewModelScope.launch {
            val result = repository.income(branchId, filter, FIRST_PAGE)
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false, isLoadingMore = false)
                when (result) {
                    is AppResult.Success -> base.copy(items = result.data.items, page = FIRST_PAGE, total = result.data.total)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    private companion object {
        const val FIRST_PAGE = 1
    }
}
