package com.schoolapp.feature.admin.users.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.users.UsersRepository
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.users.UserPermissions
import com.schoolapp.feature.admin.users.assignments.NamedOption
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

/** Principals & admin users: search, role / branch / status filters, paged with "load more". */
@OptIn(FlowPreview::class)
@HiltViewModel
class UsersListViewModel @Inject constructor(
    private val repository: UsersRepository,
    private val organisation: OrganisationRepository,
    authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val _uiState = MutableStateFlow(UsersListUiState())
    val uiState: StateFlow<UsersListUiState> = _uiState.asStateFlow()
    val notice: StateFlow<AdminNotice?> = notices.notice
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.map(UserPermissions::of).distinctUntilChanged().collect { permissions ->
                _uiState.update { it.copy(permissions = permissions) }
            }
        }
        viewModelScope.launch {
            _uiState.map { it.query.trim() }.distinctUntilChanged().drop(1).debounce(SEARCH_DEBOUNCE_MS).collect { load(Mode.Initial) }
        }
        viewModelScope.launch { repository.changes.drop(1).collect { load(Mode.Quiet) } }
        viewModelScope.launch { loadBranches() }
        load(Mode.Initial)
    }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun onRoleChange(role: String?) = applyFilter { it.copy(role = role) }

    fun onBranchChange(branchId: String?) = applyFilter { it.copy(branchId = branchId) }

    fun onStatusChange(status: String?) = applyFilter { it.copy(status = status) }

    fun resetFilters() = applyFilter { it.copy(query = "", role = null, branchId = null, status = null) }

    fun refresh() = load(Mode.Refresh)

    fun retry() = load(Mode.Initial)

    fun consumeNotice(notice: AdminNotice) = notices.consume(notice)

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || loadJob?.isActive == true) return
        _uiState.update { it.copy(isLoadingMore = true, moreError = null) }
        loadJob = viewModelScope.launch {
            val next = state.page + 1
            when (val result = repository.users(state.filter, next)) {
                is AppResult.Success -> _uiState.update {
                    val merged = (it.users + result.data.items).distinctBy { user -> user.id }
                    it.copy(isLoadingMore = false, users = merged, page = next, hasMore = result.data.hasMore)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoadingMore = false, moreError = result.error) }
            }
        }
    }

    private fun applyFilter(change: (UsersListUiState) -> UsersListUiState) {
        val before = _uiState.value
        val after = change(before)
        if (after.filter == before.filter) return
        _uiState.value = after
        load(Mode.Initial)
    }

    private suspend fun loadBranches() {
        val branches = (organisation.branches() as? AppResult.Success)?.data.orEmpty().filter { it.status == null || it.status == ACTIVE }
        val multiSchool = branches.mapNotNull { it.schoolId }.distinct().size > 1
        val options = branches.map { NamedOption(it.id, if (multiSchool && it.schoolName != null) "${it.schoolName} › ${it.name}" else it.name) }
        _uiState.update { it.copy(branches = options) }
    }

    private fun load(mode: Mode) {
        loadJob?.cancel()
        _uiState.update {
            it.copy(
                isLoading = mode == Mode.Initial,
                isRefreshing = mode == Mode.Refresh,
                isLoadingMore = false,
                error = if (mode == Mode.Quiet) it.error else null,
                moreError = null,
            )
        }
        loadJob = viewModelScope.launch {
            val result = repository.users(_uiState.value.filter, page = 1)
            _uiState.update {
                val base = it.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(users = result.data.items, page = 1, hasMore = result.data.hasMore, error = null)
                    is AppResult.Failure -> if (mode == Mode.Quiet && it.users.isNotEmpty()) base else base.copy(error = result.error)
                }
            }
        }
    }

    private enum class Mode { Initial, Refresh, Quiet }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
        const val ACTIVE = "ACTIVE"
    }
}
