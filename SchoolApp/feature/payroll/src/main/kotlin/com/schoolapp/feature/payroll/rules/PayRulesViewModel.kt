package com.schoolapp.feature.payroll.rules

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.setup.PayrollSetupRepository
import com.schoolapp.core.model.payroll.setup.PayRules
import com.schoolapp.core.model.payroll.setup.PayRulesView
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class PayRulesUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val view: PayRulesView? = null,
    val rules: PayRules? = null,
    /** Paid hours a day as typed; empty = branch timings. */
    val dailyHours: String = "",
    val dailyHoursInvalid: Boolean = false,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
)

/** School pay rules read and saved through the selected branch. */
@HiltViewModel
class PayRulesViewModel @Inject constructor(private val repository: PayrollSetupRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(PayRulesUiState())
    val uiState: StateFlow<PayRulesUiState> = _uiState.asStateFlow()

    private var branchId: String? = null

    fun start(branchId: String) {
        if (this.branchId == branchId) return
        this.branchId = branchId
        load()
    }

    fun retry() = load()

    fun edit(change: (PayRules) -> PayRules) = _uiState.update { state ->
        state.copy(rules = state.rules?.let(change), saved = false)
    }

    fun onDailyHours(text: String) = _uiState.update {
        it.copy(dailyHours = text.filter { c -> c.isDigit() || c == '.' }.take(5), dailyHoursInvalid = false, saved = false)
    }

    fun save() {
        val branch = branchId ?: return
        val state = _uiState.value
        val rules = state.rules ?: return
        if (state.isSaving) return
        val hoursText = state.dailyHours.trim()
        val hours = hoursText.toDoubleOrNull()
        if (hoursText.isNotEmpty() && (hours == null || hours < MIN_HOURS || hours > MAX_HOURS)) {
            _uiState.update { it.copy(dailyHoursInvalid = true) }
            return
        }
        val toSave = rules.copy(dailyHours = hours)
        _uiState.update { it.copy(isSaving = true, saveError = null, saved = false) }
        viewModelScope.launch {
            when (val result = repository.saveRules(branch, toSave)) {
                is AppResult.Success -> _uiState.update { it.copy(isSaving = false, saved = true, rules = toSave) }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }

    private fun load() {
        val branch = branchId ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = repository.rules(branch)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(
                        isLoading = false,
                        view = result.data,
                        rules = result.data.rules,
                        dailyHours = result.data.rules.dailyHours?.let(::hoursText).orEmpty(),
                    )
                    is AppResult.Failure -> state.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        const val MIN_HOURS = 1.0
        const val MAX_HOURS = 16.0
    }
}

/** 8.0 -> "8", 7.5 -> "7.5". */
internal fun hoursText(hours: Double): String = if (hours % 1.0 == 0.0) hours.toLong().toString() else hours.toString()
