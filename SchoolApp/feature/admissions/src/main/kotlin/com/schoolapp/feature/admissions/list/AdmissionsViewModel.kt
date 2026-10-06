package com.schoolapp.feature.admissions.list

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.ApplicationStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class AdmissionsUiState(
    val isLoading: Boolean = true,
    val applications: List<AdmissionApplication> = emptyList(),
    /** Pipeline: count per status, in workflow order, zero counts left out. */
    val counts: List<Pair<ApplicationStatus, Int>> = emptyList(),
    val filter: ApplicationStatus? = null,
    val error: AppError? = null,
) {
    val visible: List<AdmissionApplication> get() = applications.filter { filter == null || it.status == filter }
}

@HiltViewModel
class AdmissionsViewModel @Inject constructor(
    private val repository: AdmissionsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdmissionsUiState())
    val uiState: StateFlow<AdmissionsUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.applications()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val byStatus = result.data.groupingBy { it.status }.eachCount()
                    val counts = ApplicationStatus.entries.mapNotNull { s -> byStatus[s]?.let { s to it } }
                    _uiState.update { it.copy(isLoading = false, applications = result.data, counts = counts) }
                }
            }
        }
    }

    fun onFilter(status: ApplicationStatus?) = _uiState.update { it.copy(filter = status) }
}
