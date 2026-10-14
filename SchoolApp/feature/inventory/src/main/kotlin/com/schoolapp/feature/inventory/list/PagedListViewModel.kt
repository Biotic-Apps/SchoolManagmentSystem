package com.schoolapp.feature.inventory.list

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.inventory.InventoryPage
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@Immutable
data class PagedList<T>(
    val items: List<T> = emptyList(),
    val page: Int = 0,
    val hasMore: Boolean = false,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: AppError? = null,
)

/**
 * A branch-scoped list fetched page by page. [bind] reloads when the branch or the shell's change
 * version moves; subclasses call [reload] when a filter changes.
 */
abstract class PagedListViewModel<T> : ViewModel() {
    private val _list = MutableStateFlow(PagedList<T>())
    val list: StateFlow<PagedList<T>> = _list.asStateFlow()

    protected var branchId: String? = null
        private set
    private var version = -1
    private var job: Job? = null

    protected abstract suspend fun fetch(branchId: String, page: Int): AppResult<InventoryPage<T>>

    fun bind(branchId: String, version: Int) {
        if (branchId == this.branchId && version == this.version) return
        val branchChanged = branchId != this.branchId
        this.branchId = branchId
        this.version = version
        if (branchChanged) {
            _list.value = PagedList()
            reload()
        } else {
            reload(quiet = true)
        }
    }

    fun refresh() {
        _list.update { it.copy(isRefreshing = true) }
        reload(quiet = true)
    }

    fun retry() = reload()

    fun loadMore() {
        val state = _list.value
        val branch = branchId ?: return
        if (!state.hasMore || state.isLoadingMore || job?.isActive == true) return
        _list.update { it.copy(isLoadingMore = true, error = null) }
        job = viewModelScope.launch {
            when (val result = fetch(branch, state.page + 1)) {
                is AppResult.Success -> _list.update {
                    it.copy(items = it.items + result.data.items, page = result.data.page, hasMore = result.data.hasMore, isLoadingMore = false)
                }
                is AppResult.Failure -> _list.update { it.copy(isLoadingMore = false, error = result.error) }
            }
        }
    }

    /** Fetches page 1 again; [quiet] keeps the current rows visible while it loads. */
    protected fun reload(quiet: Boolean = false) {
        val branch = branchId ?: return
        job?.cancel()
        if (!quiet) _list.update { it.copy(isLoading = true, error = null) }
        job = viewModelScope.launch {
            when (val result = fetch(branch, 1)) {
                is AppResult.Success -> _list.value = PagedList(
                    items = result.data.items,
                    page = result.data.page,
                    hasMore = result.data.hasMore,
                    isLoading = false,
                )
                is AppResult.Failure -> _list.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }
}
