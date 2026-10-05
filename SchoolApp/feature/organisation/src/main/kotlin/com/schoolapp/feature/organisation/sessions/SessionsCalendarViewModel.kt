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
        viewModelScope.launch {
            when (val result = optionsLoader.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val options = result.data
                    val selected = savedStateHandle.get<String>(KEY_BRANCH)?.takeIf { id -> options.branches.any { it.id == id } }
                        ?: options.preferredId?.takeIf { id -> options.branches.any { it.id == id } }
                        ?: options.branches.firstOrNull()?.id
                    _uiState.update { it.copy(branches = options.branches) }
                    if (selected == null) _uiState.update { it.copy(isLoading = false) } else onBranchSelected(selected)
                }
            }
        }
    }

    fun onBranchSelected(branchId: String) {
        savedStateHandle[KEY_BRANCH] = branchId
        _uiState.update { it.copy(selectedBranchId = branchId, isLoading = true, error = null) }
        branchJob?.cancel()
        branchJob = viewModelScope.launch {
            val sessions = when (val result = repository.sessions(branchId)) {
                is AppResult.Failure -> {
                    _uiState.update { it.copy(isLoading = false, error = result.error) }
                    return@launch
                }
                is AppResult.Success -> result.data
            }
            val active = sessions.firstOrNull { it.isActive }
            val events = repository.calendar(branchId, active?.startDate, active?.endDate)
            _uiState.update {
                when (events) {
                    is AppResult.Success -> it.copy(isLoading = false, sessions = sessions, events = events.data)
                    is AppResult.Failure -> it.copy(isLoading = false, error = events.error)
                }
            }
        }
    }

    private companion object {
        const val KEY_BRANCH = "branch"
    }
}
