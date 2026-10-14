package com.schoolapp.feature.health.alerts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Per-section allergy and medical alerts (`GET /health/alerts?sectionId=`), like the web Allergy alerts tab. */
@HiltViewModel
class AllergyAlertsViewModel @Inject constructor(
    private val healthRepository: HealthRepository,
    private val organisationRepository: OrganisationRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AllergyAlertsUiState())
    val uiState: StateFlow<AllergyAlertsUiState> = _uiState.asStateFlow()
    private var alertsJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.sections.isEmpty(), error = null) }
        viewModelScope.launch {
            val fixed = authRepository.session.first()?.activeBranchId
            if (fixed != null) return@launch loadSections(fixed)
            when (val result = organisationRepository.branches()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                is AppResult.Success -> {
                    val branches = result.data
                    val branchId = _uiState.value.branchId?.takeIf { id -> branches.any { it.id == id } } ?: branches.firstOrNull()?.id
                    _uiState.update { it.copy(branches = branches.takeIf { list -> list.size > 1 }.orEmpty(), branchId = branchId) }
                    if (branchId == null) _uiState.update { it.copy(isLoading = false, isRefreshing = false) } else loadSections(branchId)
                }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        if (_uiState.value.sectionId == null) load() else loadAlerts()
    }

    fun onBranchSelected(branchId: String) {
        if (branchId == _uiState.value.branchId) return
        _uiState.update { it.copy(branchId = branchId, sections = emptyList(), sectionId = null, alerts = emptyList(), isLoading = true, error = null) }
        viewModelScope.launch { loadSections(branchId) }
    }

    fun onSectionSelected(sectionId: String) {
        if (sectionId == _uiState.value.sectionId) return
        _uiState.update { it.copy(sectionId = sectionId, alerts = emptyList()) }
        loadAlerts()
    }

    private suspend fun loadSections(branchId: String) {
        val activeSession = (organisationRepository.sessions(branchId) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
        when (val result = organisationRepository.sections(branchId, activeSession?.id)) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            is AppResult.Success -> {
                val sections = result.data
                val current = _uiState.value.sectionId?.takeIf { id -> sections.any { it.id == id } } ?: sections.firstOrNull()?.id
                _uiState.update { it.copy(isLoading = false, branchId = branchId, sections = sections, sectionId = current) }
                if (current == null) _uiState.update { it.copy(isRefreshing = false) } else loadAlerts()
            }
        }
    }

    private fun loadAlerts() {
        val sectionId = _uiState.value.sectionId ?: return
        alertsJob?.cancel()
        _uiState.update { it.copy(isAlertsLoading = it.alerts.isEmpty(), error = null) }
        alertsJob = viewModelScope.launch {
            val result = healthRepository.alerts(sectionId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isAlertsLoading = false, isRefreshing = false, alerts = result.data)
                    is AppResult.Failure -> state.copy(isAlertsLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
