package com.schoolapp.feature.organisation.branches

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BranchDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: OrganisationRepository,
) : ViewModel() {

    private val branchId: String = checkNotNull(savedStateHandle["id"]) { "Branch id missing" }

    private val _uiState = MutableStateFlow(BranchDetailUiState())
    val uiState: StateFlow<BranchDetailUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.value = BranchDetailUiState(isLoading = true)
        fetch()
    }

    /** Keeps the shown overview while reloading; a failure leaves it in place. */
    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        fetch()
    }

    private fun fetch() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val result = repository.branchOverview(branchId)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> BranchDetailUiState(isLoading = false, overview = result.data)
                    is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
