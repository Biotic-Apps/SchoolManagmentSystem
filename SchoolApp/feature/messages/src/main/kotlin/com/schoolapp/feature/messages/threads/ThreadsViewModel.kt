package com.schoolapp.feature.messages.threads

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.model.RoleKey
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

/** Own threads; parents see only the active child's threads and the list reloads on child switch. */
@HiltViewModel
class ThreadsViewModel @Inject constructor(
    private val repository: MessagesRepository,
    authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private data class Scope(val isParent: Boolean, val userId: String, val childId: String?)

    private val _uiState = MutableStateFlow(ThreadsUiState(today = clock.now().toLocalDate()))
    val uiState: StateFlow<ThreadsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var resumedOnce = false

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { session ->
                    val parent = session.activeRole == RoleKey.PARENT
                    Scope(parent, session.user.id, if (parent) session.activeChild?.id else null)
                }
                .distinctUntilChanged()
                .collect { scope ->
                    _uiState.update {
                        it.copy(
                            isParent = scope.isParent,
                            myUserId = scope.userId,
                            childId = scope.childId,
                            isLoading = true,
                            threads = emptyList(),
                            error = null,
                        )
                    }
                    load()
                }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    /** Re-fetch when the screen comes back (unread counts change after reading a thread); skips the first resume. */
    fun onResume() {
        if (!resumedOnce) {
            resumedOnce = true
            return
        }
        load()
    }

    private fun load() {
        val state = _uiState.value
        val studentId = if (state.isParent) state.childId else null
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            when (val result = repository.threads(studentId)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, isRefreshing = false, threads = result.data, error = null)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }
}
