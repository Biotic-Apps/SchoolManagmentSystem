package com.schoolapp.feature.payroll.run

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.PayrollRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One payroll run with its staff lines (read-only; calculation and payments happen on the web panel). */
@HiltViewModel
class PayrollRunViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: PayrollRepository,
) : ViewModel() {

    private val runId: String = checkNotNull(savedStateHandle["runId"])
    private val _uiState = MutableStateFlow(PayrollRunUiState())
    val uiState: StateFlow<PayrollRunUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun retry() = load()

    private fun load() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            _uiState.update { state ->
                when (val result = repository.run(runId)) {
                    is AppResult.Success -> state.copy(isLoading = false, run = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, error = result.error)
                }
            }
        }
    }
}
