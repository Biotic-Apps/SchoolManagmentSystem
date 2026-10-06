package com.schoolapp.feature.fees.staff.dues

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.model.fees.DuesRow
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Students with a balance in the active branch, largest balance first; searchable. */
@HiltViewModel
class DuesViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: FeesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(DuesUiState())
    val uiState: StateFlow<DuesUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    init {
        loadJob = viewModelScope.launch {
            branchId = authRepository.session.filterNotNull().first().activeBranchId
            load()
        }
    }

    fun onSearchChange(text: String) {
        _uiState.update { it.copy(search = text) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            load()
        }
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        relaunch()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        relaunch()
    }

    private fun relaunch() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch { load() }
    }

    private suspend fun load() {
        val search = _uiState.value.search.trim().takeIf { it.isNotEmpty() }
        val result = repository.dues(search = search, branchId = branchId)
        _uiState.update {
            when (result) {
                is AppResult.Success -> it.copy(
                    isLoading = false,
                    isRefreshing = false,
                    error = null,
                    rows = result.data.sortedByDescending(DuesRow::balanceMinor),
                )
                is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error)
            }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
    }
}
