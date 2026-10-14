package com.schoolapp.feature.health.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.health.Incident
import com.schoolapp.feature.health.components.StudentSearch
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Branch incidents in a date range (server paged) plus a student search that opens health cards. */
@HiltViewModel
class HealthMenuViewModel @Inject constructor(
    private val healthRepository: HealthRepository,
    studentsRepository: StudentsRepository,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(HealthMenuUiState())
    val uiState: StateFlow<HealthMenuUiState> = _uiState.asStateFlow()
    private var listJob: Job? = null

    private val search = StudentSearch(viewModelScope, studentsRepository) { transform ->
        _uiState.update { it.copy(search = transform(it.search)) }
    }

    init {
        val today = clock.now().toLocalDate()
        _uiState.update { it.copy(today = today.toString(), to = today.toString(), from = today.minusDays(WINDOW_DAYS).toString()) }
        load()
    }

    /** Reloads page 1 (first load, retry, pull-to-refresh, filter change). */
    fun load() {
        _uiState.update { it.copy(isLoading = it.incidents.isEmpty(), isRefreshing = it.incidents.isNotEmpty(), error = null, moreError = null) }
        fetch(page = 1)
    }

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || state.isLoading) return
        _uiState.update { it.copy(isLoadingMore = true, moreError = null) }
        fetch(page = state.page + 1)
    }

    fun onFromChange(date: String) {
        _uiState.update { it.copy(from = date, to = if (it.to < date) date else it.to, incidents = emptyList()) }
        load()
    }

    fun onToChange(date: String) {
        _uiState.update { it.copy(to = date, from = if (it.from > date) date else it.from, incidents = emptyList()) }
        load()
    }

    private fun fetch(page: Int) {
        if (page == 1) listJob?.cancel()
        listJob = viewModelScope.launch {
            val session = authRepository.session.first()
            val state = _uiState.value
            val result = healthRepository.incidentsPage(session?.activeBranchId, state.from, state.to, page, PAGE_SIZE)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoading = false,
                        isRefreshing = false,
                        isLoadingMore = false,
                        page = result.data.page,
                        hasMore = result.data.hasNext,
                        incidents = if (page == 1) result.data.items else (current.incidents + result.data.items).distinctBy(Incident::id),
                        canClose = session?.has(EDIT_PERMISSION) == true,
                    )
                    is AppResult.Failure -> if (page == 1) {
                        current.copy(isLoading = false, isRefreshing = false, error = result.error)
                    } else {
                        current.copy(isLoadingMore = false, moreError = result.error)
                    }
                }
            }
        }
    }

    fun onTabSelected(tab: HealthTab) = _uiState.update { it.copy(tab = tab) }

    fun onQueryChange(query: String) = search.onQueryChange(query)

    fun onCloseRequested(incident: Incident) = _uiState.update { it.copy(confirmClose = incident, actionError = null) }

    fun onCloseDismissed() = _uiState.update { it.copy(confirmClose = null) }

    fun confirmClose() {
        val incident = _uiState.value.confirmClose ?: return
        _uiState.update { it.copy(confirmClose = null, closingId = incident.id, actionError = null) }
        viewModelScope.launch {
            when (val result = healthRepository.closeIncident(incident.id, null)) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(closingId = null, incidents = state.incidents.map { if (it.id == incident.id) result.data else it })
                }
                is AppResult.Failure -> _uiState.update { it.copy(closingId = null, actionError = result.error) }
            }
        }
    }

    private companion object {
        const val EDIT_PERMISSION = "health.edit"
        const val WINDOW_DAYS = 30L
        const val PAGE_SIZE = 20
    }
}
