package com.schoolapp.feature.complaints.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.model.complaint.ComplaintBox
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

/** Complaint boxes visible to the active role; tabs follow the session (role switch). */
@HiltViewModel
class ComplaintsViewModel @Inject constructor(
    private val repository: ComplaintsRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ComplaintsUiState())
    val uiState: StateFlow<ComplaintsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var resumedOnce = false

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map(::complaintTabs).distinctUntilChanged().collect { tabs ->
                _uiState.update { state ->
                    state.copy(tabs = tabs, box = state.box.takeIf { it in tabs } ?: tabs.first(), isLoading = true, items = emptyList())
                }
                load()
            }
        }
    }

    fun onTabSelected(box: ComplaintBox) {
        if (box == _uiState.value.box || box !in _uiState.value.tabs) return
        _uiState.update { it.copy(box = box, isLoading = true, items = emptyList(), error = null) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    /** Re-fetch when coming back from detail or filing; skips the first resume. */
    fun onResume() {
        if (!resumedOnce) {
            resumedOnce = true
            return
        }
        load()
    }

    private fun load() {
        val box = _uiState.value.box
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            when (val result = repository.complaints(box)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, isRefreshing = false, items = result.data, error = null)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }
}
