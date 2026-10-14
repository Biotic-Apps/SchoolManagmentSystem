package com.schoolapp.feature.accounts.profitloss

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.accounts.AccountsRepository
import com.schoolapp.core.model.accounts.ProfitLoss
import com.schoolapp.feature.accounts.common.DateRange
import com.schoolapp.feature.accounts.common.RangePreset
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfitLossUiState(
    val branchId: String? = null,
    val preset: RangePreset = RangePreset.THIS_MONTH,
    val range: DateRange = DateRange("", ""),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val report: ProfitLoss? = null,
)

/** Branch profit & loss for a date range (default: first of this month to today, like the web). */
@HiltViewModel
class ProfitLossViewModel @Inject constructor(
    private val repository: AccountsRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfitLossUiState(range = DateRange.of(RangePreset.THIS_MONTH, today())))
    val uiState: StateFlow<ProfitLossUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    fun setBranch(branchId: String) {
        if (_uiState.value.branchId == branchId) return
        _uiState.update { it.copy(branchId = branchId, report = null) }
        load(refreshing = false)
    }

    fun selectPreset(preset: RangePreset) {
        if (preset == RangePreset.CUSTOM) {
            _uiState.update { it.copy(preset = preset) }
            return
        }
        _uiState.update { it.copy(preset = preset, range = DateRange.of(preset, today())) }
        load(refreshing = false)
    }

    fun setFrom(date: String) = setRange(_uiState.value.range.copy(from = date))

    fun setTo(date: String) = setRange(_uiState.value.range.copy(to = date))

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    private fun setRange(range: DateRange) {
        _uiState.update { it.copy(preset = RangePreset.CUSTOM, range = range) }
        load(refreshing = false)
    }

    private fun load(refreshing: Boolean) {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        if (!state.range.isValid) return
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.profitLoss(branchId, state.range.from, state.range.to)
            _uiState.update { current ->
                val base = current.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(report = result.data)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    private fun today() = clock.now().toLocalDate()
}
