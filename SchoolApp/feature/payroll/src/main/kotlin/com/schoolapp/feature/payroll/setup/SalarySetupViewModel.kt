package com.schoolapp.feature.payroll.setup

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.setup.PayrollSetupRepository
import com.schoolapp.core.model.payroll.setup.PayrollStaffList
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class SalarySetupUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val list: PayrollStaffList? = null,
    val staffType: String = ALL_TYPES,
    val addingPrincipal: Boolean = false,
    val principalAdded: Boolean = false,
    val actionError: AppError? = null,
) {
    /** The principal has a login but no payroll record yet. */
    val principalMissing: Boolean get() = list?.principal?.let { it.staffId == null } == true
}

/** Salary setup of one branch: staff of every type with their current salary (null = not set yet). */
@HiltViewModel
class SalarySetupViewModel @Inject constructor(private val repository: PayrollSetupRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(SalarySetupUiState())
    val uiState: StateFlow<SalarySetupUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    fun start(branchId: String) {
        if (this.branchId == branchId) return
        this.branchId = branchId
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun onStaffType(type: String) {
        if (type == _uiState.value.staffType) return
        _uiState.update { it.copy(staffType = type) }
        load(refreshing = false)
    }

    fun addPrincipal() {
        val branch = branchId ?: return
        if (_uiState.value.addingPrincipal) return
        _uiState.update { it.copy(addingPrincipal = true, actionError = null, principalAdded = false) }
        viewModelScope.launch {
            when (val result = repository.addPrincipal(branch)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(addingPrincipal = false, principalAdded = true) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(addingPrincipal = false, actionError = result.error) }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        val branch = branchId ?: return
        val type = _uiState.value.staffType.takeIf { it != ALL_TYPES }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val result = repository.staff(branch, type)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, list = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
