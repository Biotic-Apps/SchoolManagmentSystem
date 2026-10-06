package com.schoolapp.feature.organisation.sessions

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SessionsCalendarViewModel @Inject constructor(
    private val optionsLoader: BranchOptionsLoader,
    private val repository: OrganisationRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SessionsCalendarUiState())
    val uiState: StateFlow<SessionsCalendarUiState> = _uiState.asStateFlow()

    private var branchJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadOptions(refreshing = false)
    }

    /** Reloads the selected branch while sessions and events stay visible; a failure keeps them. */
    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        val branchId = _uiState.value.selectedBranchId
        if (branchId == null) loadOptions(refreshing = true) else fetchBranch(branchId, refreshing = true)
    }

    fun onBranchSelected(branchId: String) = fetchBranch(branchId, refreshing = false)

    private fun loadOptions(refreshing: Boolean) {
        viewModelScope.launch {
            when (val result = optionsLoader.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                is AppResult.Success -> {
                    val options = result.data
                    val selected = savedStateHandle.get<String>(KEY_BRANCH)?.takeIf { id -> options.branches.any { it.id == id } }
                        ?: options.preferredId?.takeIf { id -> options.branches.any { it.id == id } }
                        ?: options.branches.firstOrNull()?.id
                    _uiState.update { it.copy(branches = options.branches) }
                    if (selected == null) {
                        _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = null) }
                    } else {
                        fetchBranch(selected, refreshing)
                    }
                }
            }
        }
    }

    private fun fetchBranch(branchId: String, refreshing: Boolean) {
        savedStateHandle[KEY_BRANCH] = branchId
        _uiState.update {
            if (refreshing) {
                it.copy(selectedBranchId = branchId, isRefreshing = true)
            } else {
                it.copy(selectedBranchId = branchId, isLoading = true, error = null, sessions = emptyList(), events = emptyList())
            }
        }
        branchJob?.cancel()
        branchJob = viewModelScope.launch {
            val sessions = when (val result = repository.sessions(branchId)) {
                is AppResult.Failure -> {
                    _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                    return@launch
                }
                is AppResult.Success -> result.data
            }
            val active = sessions.firstOrNull { it.isActive }
            val events = repository.calendar(branchId, active?.startDate, active?.endDate)
            _uiState.update {
                when (events) {
                    is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, error = null, sessions = sessions, events = events.data)
                    is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = events.error)
                }
            }
        }
    }

    private companion object {
        const val KEY_BRANCH = "branch"
    }
}
