package com.schoolapp.feature.notices.paging

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.notice.NoticeStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Loads [NoticePage]s for one query; a new [reload] cancels a running load. */
internal class NoticePager(private val repository: NoticesRepository, private val scope: CoroutineScope) {
    private val _state = MutableStateFlow(NoticePage())
    val state: StateFlow<NoticePage> = _state.asStateFlow()

    private var job: Job? = null
    private var query: Pair<String?, NoticeStatus?> = null to null

    fun reload(branchId: String?, status: NoticeStatus?, refresh: Boolean = false) {
        query = branchId to status
        job?.cancel()
        _state.update { if (refresh) it.starting(true) else NoticePage() }
        job = scope.launch {
            when (val result = repository.notices(branchId, status, page = 1)) {
                is AppResult.Success -> _state.value = _state.value.firstPage(result.data)
                is AppResult.Failure -> _state.update { it.failed(result.error) }
            }
        }
    }

    fun refresh() = reload(query.first, query.second, refresh = true)

    fun loadMore() {
        val current = _state.value
        if (!current.hasMore || current.isLoadingMore || current.isLoading || current.isRefreshing) return
        _state.update { it.copy(isLoadingMore = true, loadMoreError = null) }
        val (branchId, status) = query
        job = scope.launch {
            when (val result = repository.notices(branchId, status, page = current.page + 1)) {
                is AppResult.Success -> _state.update { it.nextPage(result.data) }
                is AppResult.Failure -> _state.update { it.copy(isLoadingMore = false, loadMoreError = result.error) }
            }
        }
    }

    fun update(transform: (NoticePage) -> NoticePage) = _state.update(transform)
}
