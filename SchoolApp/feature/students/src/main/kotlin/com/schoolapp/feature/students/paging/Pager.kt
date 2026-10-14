package com.schoolapp.feature.students.paging

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.PagedList
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** A server-paged list as the screen sees it: rows so far, first-load / refresh / next-page progress and errors. */
@Immutable
data class Paged<T>(
    val items: List<T> = emptyList(),
    val page: Int = 0,
    val hasMore: Boolean = false,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    /** First page failed (shown as a full error state). */
    val error: AppError? = null,
    /** A later page failed (rows stay; a retry row shows). */
    val moreError: AppError? = null,
)

/**
 * Loads [fetch] page by page into [state]. [reload] starts again from page 1 (filters changed),
 * [refresh] does it quietly (pull-to-refresh), [loadMore] appends the next page once.
 */
class Pager<T>(
    private val scope: CoroutineScope,
    private val fetch: suspend (page: Int) -> AppResult<PagedList<T>>,
) {
    private val _state = MutableStateFlow(Paged<T>())
    val state: StateFlow<Paged<T>> = _state.asStateFlow()
    private var job: Job? = null

    fun reload(quiet: Boolean = false) {
        job?.cancel()
        if (quiet) _state.update { it.copy(isRefreshing = true) } else _state.update { Paged() }
        job = scope.launch {
            when (val result = fetch(1)) {
                is AppResult.Success -> _state.value = Paged(
                    items = result.data.items,
                    page = 1,
                    hasMore = result.data.hasNext && result.data.items.isNotEmpty(),
                    isLoading = false,
                )
                is AppResult.Failure -> _state.update {
                    it.copy(isLoading = false, isRefreshing = false, error = if (quiet && it.items.isNotEmpty()) null else result.error, moreError = if (quiet) result.error else null)
                }
            }
        }
    }

    fun refresh() = reload(quiet = true)

    fun loadMore() {
        val current = _state.value
        if (!current.hasMore || current.isLoadingMore || current.isLoading || job?.isActive == true) return
        _state.update { it.copy(isLoadingMore = true, moreError = null) }
        job = scope.launch {
            when (val result = fetch(current.page + 1)) {
                is AppResult.Success -> _state.update {
                    val known = it.items.toSet()
                    it.copy(
                        items = it.items + result.data.items.filterNot(known::contains),
                        page = current.page + 1,
                        hasMore = result.data.hasNext && result.data.items.isNotEmpty(),
                        isLoadingMore = false,
                    )
                }
                is AppResult.Failure -> _state.update { it.copy(isLoadingMore = false, moreError = result.error) }
            }
        }
    }

    /** Edits the loaded rows in place (e.g. drop a decided request) without refetching. */
    fun edit(change: (List<T>) -> List<T>) = _state.update { it.copy(items = change(it.items)) }
}
