package com.schoolapp.feature.payroll.salary

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.payroll.PayrollRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/** Staff: own payslip month by month (never beyond the current month). */
@HiltViewModel
class MySalaryViewModel @Inject constructor(
    private val repository: PayrollRepository,
    clock: AppClock,
) : ViewModel() {

    private val current = YearMonth.from(clock.now())
    private val _uiState = MutableStateFlow(MySalaryUiState(month = current, currentMonth = current))
    val uiState: StateFlow<MySalaryUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load()
    }

    fun onPreviousMonth() = changeMonth(_uiState.value.month.minusMonths(1))

    fun onNextMonth() {
        if (_uiState.value.canGoNext) changeMonth(_uiState.value.month.plusMonths(1))
    }

    fun retry() = load()

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, payslip = null) }
        load()
    }

    private fun load() {
        val month = _uiState.value.month
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = repository.myPayslip(month.toString())
            _uiState.update { state ->
                if (state.month != month) return@update state
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, payslip = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, error = result.error, payslip = null)
                }
            }
        }
    }
}
