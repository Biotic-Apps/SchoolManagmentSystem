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
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Branch incidents of the last 30 days plus a student search that opens health cards. */
@HiltViewModel
class HealthMenuViewModel @Inject constructor(
    private val healthRepository: HealthRepository,
    studentsRepository: StudentsRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(HealthMenuUiState())
    val uiState: StateFlow<HealthMenuUiState> = _uiState.asStateFlow()

    private val search = StudentSearch(viewModelScope, studentsRepository) { transform ->
        _uiState.update { it.copy(search = transform(it.search)) }
    }

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.incidents.isEmpty(), isRefreshing = it.incidents.isNotEmpty(), error = null) }
        viewModelScope.launch {
            val session = authRepository.session.first()
            val from = clock.now().toLocalDate().minusDays(WINDOW_DAYS).toString()
            val result = healthRepository.incidents(branchId = session?.activeBranchId, from = from)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(
                        isLoading = false,
                        isRefreshing = false,
                        incidents = result.data.sortedByDescending(Incident::occurredAt),
                        canClose = session?.has(EDIT_PERMISSION) == true,
                    )
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
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
    }
}
