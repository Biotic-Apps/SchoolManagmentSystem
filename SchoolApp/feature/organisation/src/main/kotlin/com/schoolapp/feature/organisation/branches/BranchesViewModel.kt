package com.schoolapp.feature.organisation.branches

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.organisation.branches.edit.BranchEditor
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BranchesViewModel @Inject constructor(
    private val repository: OrganisationRepository,
    /** Add / edit / archive, settings and principal actions (permission-gated). */
    val editor: BranchEditor,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BranchesUiState())
    val uiState: StateFlow<BranchesUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        editor.attach(viewModelScope, ::refresh)
        load()
    }

    fun load() {
        _uiState.value = BranchesUiState(isLoading = true)
        fetch()
    }

    /** Reloads while the current list or overview stays on screen; a failure keeps it. */
    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        fetch()
    }

    private fun fetch() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            when (val result = loadContent()) {
                is AppResult.Success -> _uiState.value = result.data
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }

    private suspend fun loadContent(): AppResult<BranchesUiState> {
        val branches: List<Branch> = when (val result = repository.branches()) {
            is AppResult.Failure -> return result
            is AppResult.Success -> result.data
        }
        val single = branches.singleOrNull() ?: return AppResult.Success(BranchesUiState(isLoading = false, branches = branches))
        val overview: BranchOverview = when (val result = repository.branchOverview(single.id)) {
            is AppResult.Failure -> return result
            is AppResult.Success -> result.data
        }
        return AppResult.Success(BranchesUiState(isLoading = false, branches = branches, overview = overview))
    }
}
