package com.schoolapp.feature.admissions.list

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.feature.admissions.common.AdmissionPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class AdmissionsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val applications: List<AdmissionApplication> = emptyList(),
    /** Pipeline: count per status, in workflow order, zero counts left out. */
    val counts: List<Pair<ApplicationStatus, Int>> = emptyList(),
    val filter: ApplicationStatus? = null,
    /** Application no., child or guardian name / phone. */
    val query: String = "",
    val error: AppError? = null,
    /** `admissions.add`: "New application". */
    val canAdd: Boolean = false,
) {
    val visible: List<AdmissionApplication>
        get() {
            val q = query.trim()
            return applications.filter { app ->
                (filter == null || app.status == filter) && (q.isEmpty() || app.matches(q))
            }
        }
}

private fun AdmissionApplication.matches(q: String): Boolean =
    childName.contains(q, ignoreCase = true) ||
        applicationNo?.contains(q, ignoreCase = true) == true ||
        guardians.any { it.name.contains(q, ignoreCase = true) || it.phone?.contains(q) == true }

/** Applications tab: all applications in scope with status chips and search. */
@HiltViewModel
class AdmissionsViewModel @Inject constructor(
    private val repository: AdmissionsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdmissionsUiState())
    val uiState: StateFlow<AdmissionsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canAdd = session.has(AdmissionPermissions.ADD)) }
        }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.applications.isEmpty() && !it.isRefreshing, error = null) }
        viewModelScope.launch {
            when (val result = repository.applications()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                is AppResult.Success -> {
                    val byStatus = result.data.groupingBy { it.status }.eachCount()
                    val counts = ApplicationStatus.entries.mapNotNull { s -> byStatus[s]?.let { s to it } }
                    _uiState.update { it.copy(isLoading = false, isRefreshing = false, applications = result.data, counts = counts) }
                }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun onFilter(status: ApplicationStatus?) = _uiState.update { it.copy(filter = status) }

    fun onQuery(query: String) = _uiState.update { it.copy(query = query) }
}
