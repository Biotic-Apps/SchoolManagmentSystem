package com.schoolapp.feature.organisation.branches

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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

    init {
        load()
    }

    fun load() {
        _uiState.value = BranchDetailUiState(isLoading = true)
        viewModelScope.launch {
            _uiState.value = when (val result = repository.branchOverview(branchId)) {
                is AppResult.Success -> BranchDetailUiState(isLoading = false, overview = result.data)
                is AppResult.Failure -> BranchDetailUiState(isLoading = false, error = result.error)
            }
        }
    }
}
