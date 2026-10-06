package com.schoolapp.feature.payroll.runs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.payroll.PayrollRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Principal / accountant / super admin: payroll runs of the active branch, newest month first. */
@HiltViewModel
class PayrollRunsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: PayrollRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PayrollRunsUiState())
    val uiState: StateFlow<PayrollRunsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun sendForApproval(runId: String) {
        if (_uiState.value.sendingId != null) return
        _uiState.update { it.copy(sendingId = runId, sentRunId = null, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.requestApproval(runId)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(sendingId = null, sentRunId = runId) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(sendingId = null, actionError = result.error) }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing && it.runs.isEmpty(), isRefreshing = refreshing, error = null) }
            val session = authRepository.session.first()
            val result = repository.runs(branchId = session?.activeBranchId)
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false, canApprove = session?.has(APPROVE) == true)
                when (result) {
                    is AppResult.Success -> base.copy(runs = result.data.sortedByDescending { it.month })
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    private companion object {
        const val APPROVE = "payroll.approve"
    }
}
