package com.schoolapp.feature.complaints.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Complaint boxes visible to the active role (tabs follow the session), filtered by status/category and paged. */
@HiltViewModel
class ComplaintsViewModel @Inject constructor(
    private val repository: ComplaintsRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ComplaintsUiState())
    val uiState: StateFlow<ComplaintsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var resumedOnce = false

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map(::complaintTabs).distinctUntilChanged().collect { tabs ->
                _uiState.update { state ->
                    state.copy(tabs = tabs, box = state.box.takeIf { it in tabs } ?: tabs.first(), isLoading = true, items = emptyList())
                }
                fetch(reset = true)
            }
        }
    }

    fun onTabSelected(box: ComplaintBox) {
        if (box == _uiState.value.box || box !in _uiState.value.tabs) return
        _uiState.update { it.copy(box = box) }
        restart()
    }

    fun onStatusSelected(status: ComplaintStatus?) {
        if (status == _uiState.value.status) return
        _uiState.update { it.copy(status = status) }
        restart()
    }

    fun onCategorySelected(category: ComplaintCategory?) {
        if (category == _uiState.value.category) return
        _uiState.update { it.copy(category = category) }
        restart()
    }

    fun onSearchChange(text: String) = _uiState.update { it.copy(search = text) }

    fun onClearFilters() {
        _uiState.update { it.copy(status = null, category = null, search = "") }
        restart()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        fetch(reset = true)
    }

    /** Re-fetch when coming back from detail or filing; skips the first resume. */
    fun onResume() {
        if (!resumedOnce) {
            resumedOnce = true
            return
        }
        fetch(reset = true)
    }

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || state.isLoading || state.loadMoreError != null) return
        fetch(reset = false)
    }

    fun retryMore() {
        _uiState.update { it.copy(loadMoreError = null) }
        loadMore()
    }

    private fun restart() {
        _uiState.update { it.copy(isLoading = true, items = emptyList(), error = null, loadMoreError = null) }
        fetch(reset = true)
    }

    private fun fetch(reset: Boolean) {
        val state = _uiState.value
        val page = if (reset) 1 else state.page + 1
        loadJob?.cancel()
        if (!reset) _uiState.update { it.copy(isLoadingMore = true, loadMoreError = null) }
        loadJob = viewModelScope.launch {
            when (val result = repository.complaintsPage(state.box, state.status, state.category, page, PAGE_SIZE)) {
                is AppResult.Success -> _uiState.update { current ->
                    val known = if (reset) emptySet() else current.items.map { it.id }.toSet()
                    current.copy(
                        isLoading = false,
                        isRefreshing = false,
                        isLoadingMore = false,
                        items = (if (reset) emptyList() else current.items) + result.data.items.filterNot { it.id in known },
                        page = page,
                        total = result.data.total,
                        error = null,
                        loadMoreError = null,
                    )
                }
                is AppResult.Failure -> _uiState.update {
                    if (reset) {
                        it.copy(isLoading = false, isRefreshing = false, isLoadingMore = false, error = result.error)
                    } else {
                        it.copy(isLoadingMore = false, loadMoreError = result.error)
                    }
                }
            }
        }
    }

    private companion object {
        const val PAGE_SIZE = 20
    }
}
