package com.schoolapp.feature.approvals

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.model.approval.ApprovalStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Inbox: requests the user can decide or requested, filtered by status and type, server paged. */
@HiltViewModel
class ApprovalsViewModel @Inject constructor(
    private val repository: ApprovalsRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ApprovalsUiState(
            filter = savedStateHandle.get<String>(KEY_FILTER)?.let(ApprovalStatus::fromKey) ?: ApprovalStatus.PENDING,
            type = savedStateHandle.get<String>(KEY_TYPE),
        ),
    )
    val uiState: StateFlow<ApprovalsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load(refreshing = false)
        viewModelScope.launch { repository.changes.collect { load(refreshing = true) } }
    }

    fun onFilterSelected(status: ApprovalStatus) {
        if (status == _uiState.value.filter) return
        savedStateHandle[KEY_FILTER] = status.name
        _uiState.update { it.copy(filter = status, items = emptyList()) }
        load(refreshing = false)
    }

    fun onTypeSelected(type: String?) {
        if (type == _uiState.value.type) return
        savedStateHandle[KEY_TYPE] = type
        _uiState.update { it.copy(type = type, items = emptyList()) }
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || state.isLoading) return
        _uiState.update { it.copy(isLoadingMore = true, moreError = null) }
        fetch(page = state.page + 1)
    }

    private fun load(refreshing: Boolean) {
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null, moreError = null, isLoadingMore = false) }
        fetch(page = 1)
    }

    private fun fetch(page: Int) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val state = _uiState.value
            val result = repository.inboxPage(state.filter, state.type, page, PAGE_SIZE)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(
                        isLoading = false,
                        isRefreshing = false,
                        isLoadingMore = false,
                        page = result.data.page,
                        hasMore = result.data.hasNext,
                        items = if (page == 1) result.data.items else (it.items + result.data.items).distinctBy { row -> row.id },
                    )
                    is AppResult.Failure -> if (page == 1) {
                        it.copy(isLoading = false, isRefreshing = false, error = result.error)
                    } else {
                        it.copy(isLoadingMore = false, moreError = result.error)
                    }
                }
            }
        }
    }

    private companion object {
        const val KEY_FILTER = "filter"
        const val KEY_TYPE = "type"
        const val PAGE_SIZE = 20
    }
}
