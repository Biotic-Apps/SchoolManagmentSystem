package com.schoolapp.feature.messages.threads

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.message.ThreadQuery
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

/**
 * Inbox: own threads (parents: the active child's) or, for branch readers, every thread of the branch
 * (read-only). Server-paged; unread-only is a server filter, search filters the loaded rows.
 */
@HiltViewModel
class ThreadsViewModel @Inject constructor(
    private val repository: MessagesRepository,
    authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private data class Scope(val isParent: Boolean, val userId: String, val childId: String?, val canReadBranch: Boolean)

    private val _uiState = MutableStateFlow(ThreadsUiState(today = clock.now().toLocalDate()))
    val uiState: StateFlow<ThreadsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var resumedOnce = false

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { session ->
                    val parent = session.activeRole == RoleKey.PARENT
                    Scope(
                        isParent = parent,
                        userId = session.user.id,
                        childId = if (parent) session.activeChild?.id else null,
                        canReadBranch = (session.activeRole as? RoleKey) in BRANCH_READERS,
                    )
                }
                .distinctUntilChanged()
                .collect { scope ->
                    _uiState.update {
                        it.copy(
                            isParent = scope.isParent,
                            myUserId = scope.userId,
                            childId = scope.childId,
                            canReadBranch = scope.canReadBranch,
                            branchScope = it.branchScope && scope.canReadBranch,
                            isLoading = true,
                            threads = emptyList(),
                            error = null,
                        )
                    }
                    fetch(reset = true)
                }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        fetch(reset = true)
    }

    fun onSearchChange(text: String) = _uiState.update { it.copy(search = text) }

    fun onUnreadOnlyChange(value: Boolean) {
        if (_uiState.value.unreadOnly == value) return
        _uiState.update { it.copy(unreadOnly = value, isLoading = true, threads = emptyList(), error = null) }
        fetch(reset = true)
    }

    fun onBranchScopeChange(value: Boolean) {
        val state = _uiState.value
        if (state.branchScope == value || (value && !state.canReadBranch)) return
        _uiState.update { it.copy(branchScope = value, isLoading = true, threads = emptyList(), error = null) }
        fetch(reset = true)
    }

    /** Re-fetch when the screen comes back (unread counts change after reading a thread); skips the first resume. */
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

    private fun fetch(reset: Boolean) {
        val state = _uiState.value
        val query = ThreadQuery(
            studentId = if (state.isParent) state.childId else null,
            unreadOnly = state.unreadOnly && !state.branchScope,
            branchScope = state.branchScope,
        )
        val page = if (reset) 1 else state.page + 1
        loadJob?.cancel()
        if (!reset) _uiState.update { it.copy(isLoadingMore = true, loadMoreError = null) }
        loadJob = viewModelScope.launch {
            when (val result = repository.threadsPage(query, page, PAGE_SIZE)) {
                is AppResult.Success -> _uiState.update { current ->
                    val incoming = result.data.items
                    val known = if (reset) emptySet() else current.threads.map { it.id }.toSet()
                    current.copy(
                        isLoading = false,
                        isRefreshing = false,
                        isLoadingMore = false,
                        threads = (if (reset) emptyList() else current.threads) + incoming.filterNot { it.id in known },
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
        const val PAGE_SIZE = 25

        /** Same set as the API's ThreadAccessService (super admin is always allowed). */
        val BRANCH_READERS = setOf(RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER, RoleKey.SUPER_ADMIN)
    }
}
