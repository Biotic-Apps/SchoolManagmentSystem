package com.schoolapp.feature.admin.schools.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.schools.SchoolsRepository
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.schools.SchoolPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Schools of the system: search, status filter, paged with "load more". */
@OptIn(FlowPreview::class)
@HiltViewModel
class SchoolsListViewModel @Inject constructor(
    private val repository: SchoolsRepository,
    authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SchoolsListUiState())
    val uiState: StateFlow<SchoolsListUiState> = _uiState.asStateFlow()
    val notice: StateFlow<AdminNotice?> = notices.notice

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.map(SchoolPermissions::of).distinctUntilChanged().collect { permissions ->
                _uiState.update { it.copy(permissions = permissions) }
            }
        }
        viewModelScope.launch {
            _uiState.map { it.query.trim() }.distinctUntilChanged().drop(1).debounce(SEARCH_DEBOUNCE_MS).collect { load(LoadMode.Initial) }
        }
        viewModelScope.launch { repository.changes.drop(1).collect { load(LoadMode.Quiet) } }
        load(LoadMode.Initial)
    }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun onStatusChange(status: String?) {
        if (status == _uiState.value.status) return
        _uiState.update { it.copy(status = status) }
        load(LoadMode.Initial)
    }

    fun refresh() = load(LoadMode.Refresh)

    fun retry() = load(LoadMode.Initial)

    fun consumeNotice(notice: AdminNotice) = notices.consume(notice)

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || loadJob?.isActive == true) return
        _uiState.update { it.copy(isLoadingMore = true, moreError = null) }
        loadJob = viewModelScope.launch {
            val next = state.page + 1
            when (val result = repository.schools(state.query, state.status, next)) {
                is AppResult.Success -> _uiState.update {
                    val merged = (it.schools + result.data.items).distinctBy { school -> school.id }
                    it.copy(isLoadingMore = false, schools = merged, page = next, hasMore = result.data.hasMore)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoadingMore = false, moreError = result.error) }
            }
        }
    }

    private fun load(mode: LoadMode) {
        loadJob?.cancel()
        _uiState.update {
            it.copy(
                isLoading = mode == LoadMode.Initial,
                isRefreshing = mode == LoadMode.Refresh,
                isLoadingMore = false,
                error = if (mode == LoadMode.Quiet) it.error else null,
                moreError = null,
            )
        }
        loadJob = viewModelScope.launch {
            val state = _uiState.value
            val result = repository.schools(state.query, state.status, page = 1)
            _uiState.update {
                val base = it.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(schools = result.data.items, page = 1, hasMore = result.data.hasMore, error = null)
                    is AppResult.Failure -> if (mode == LoadMode.Quiet && it.schools.isNotEmpty()) base else base.copy(error = result.error)
                }
            }
        }
    }

    private enum class LoadMode { Initial, Refresh, Quiet }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
    }
}
