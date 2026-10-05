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

/** Inbox: requests the user can decide or requested, filtered by status. */
@HiltViewModel
class ApprovalsViewModel @Inject constructor(
    private val repository: ApprovalsRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ApprovalsUiState(filter = savedStateHandle.get<String>(KEY_FILTER)?.let(ApprovalStatus::fromKey) ?: ApprovalStatus.PENDING),
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

    fun refresh() = load(refreshing = true)

    private fun load(refreshing: Boolean) {
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.inbox(_uiState.value.filter)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, items = result.data)
                    is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        const val KEY_FILTER = "filter"
    }
}
