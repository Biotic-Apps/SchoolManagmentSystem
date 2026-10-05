package com.schoolapp.feature.organisation.branches

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
class BranchesViewModel @Inject constructor(
    private val repository: OrganisationRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BranchesUiState())
    val uiState: StateFlow<BranchesUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = BranchesUiState(isLoading = true)
        viewModelScope.launch {
            val branches = when (val result = repository.branches()) {
                is AppResult.Failure -> {
                    _uiState.value = BranchesUiState(isLoading = false, error = result.error)
                    return@launch
                }
                is AppResult.Success -> result.data
            }
            val single = branches.singleOrNull()
            if (single == null) {
                _uiState.value = BranchesUiState(isLoading = false, branches = branches)
                return@launch
            }
            _uiState.value = when (val overview = repository.branchOverview(single.id)) {
                is AppResult.Success -> BranchesUiState(isLoading = false, branches = branches, overview = overview.data)
                is AppResult.Failure -> BranchesUiState(isLoading = false, error = overview.error)
            }
        }
    }
}
