package com.schoolapp.feature.payroll.adjustments

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.payroll.extras.PayrollExtrasRepository
import com.schoolapp.core.data.payroll.setup.PayrollSetupRepository
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.payroll.extras.AdjustmentInput
import com.schoolapp.core.model.payroll.extras.PayrollAdjustment
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/** Bonuses, arrears, deductions, fines and advance recoveries of a branch month, optionally for one staff member. */
@HiltViewModel
class AdjustmentsViewModel @Inject constructor(
    private val repository: PayrollExtrasRepository,
    private val setup: PayrollSetupRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdjustmentsUiState(YearMonth.from(clock.now())))
    val uiState: StateFlow<AdjustmentsUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    fun start(branchId: String) {
        if (this.branchId == branchId) return
        this.branchId = branchId
        load(refreshing = false)
        viewModelScope.launch {
            (setup.staff(branchId) as? AppResult.Success)?.data?.items?.let { staff ->
                _uiState.update { state -> state.copy(staffOptions = staff.map { PickerOption(it.staffId, it.name, it.designation) }) }
            }
        }
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun previousMonth() = changeMonth(_uiState.value.month.minusMonths(1))

    fun nextMonth() = changeMonth(_uiState.value.month.plusMonths(1))

    fun onStaff(staffId: String?) {
        _uiState.update { it.copy(staffId = staffId, notice = null) }
        load(refreshing = false)
    }

    fun openForm() = _uiState.update { it.copy(form = AdjustmentForm(staffId = it.staffId, month = it.month), notice = null) }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun editForm(change: (AdjustmentForm) -> AdjustmentForm) = _uiState.update { state ->
        val form = state.form?.let(change) ?: return@update state
        state.copy(form = if (form.issues.isEmpty()) form else form.copy(issues = form.validate()))
    }

    fun saveForm() {
        val form = _uiState.value.form ?: return
        if (form.isSaving) return
        val issues = form.validate()
        if (issues.isNotEmpty()) {
            _uiState.update { it.copy(form = form.copy(issues = issues)) }
            return
        }
        _uiState.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            val input = AdjustmentInput(
                staffId = checkNotNull(form.staffId),
                month = form.month.toString(),
                kind = checkNotNull(form.kind),
                amountMinor = MoneyFormat.parse(form.amount) ?: 0L,
                reason = form.reason,
            )
            when (val result = repository.addAdjustment(input)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(form = null, notice = AdjustmentNotice.ADDED, month = form.month) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(form = it.form?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    fun askCancel(adjustment: PayrollAdjustment) = _uiState.update { it.copy(cancel = CancelAdjustment(adjustment), notice = null) }

    fun onCancelReason(text: String) = _uiState.update { state ->
        state.copy(cancel = state.cancel?.copy(reason = text.take(AdjustmentForm.MAX_REASON), showIssue = false))
    }

    fun dismissCancel() = _uiState.update { if (it.cancel?.isSaving == true) it else it.copy(cancel = null) }

    fun confirmCancel() {
        val cancel = _uiState.value.cancel ?: return
        if (cancel.isSaving) return
        if (cancel.reason.trim().length < AdjustmentForm.MIN_REASON) {
            _uiState.update { it.copy(cancel = cancel.copy(showIssue = true)) }
            return
        }
        _uiState.update { it.copy(cancel = cancel.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.cancelAdjustment(cancel.adjustment.id, cancel.reason)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(cancel = null, notice = AdjustmentNotice.CANCELLED) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(cancel = it.cancel?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, items = null, notice = null) }
        load(refreshing = false)
    }

    private fun load(refreshing: Boolean) {
        val branch = branchId ?: return
        val state = _uiState.value
        val month = state.month
        val staffId = state.staffId
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val result = repository.adjustments(branch, month.toString(), staffId)
            _uiState.update { current ->
                if (current.month != month || current.staffId != staffId) return@update current
                val idle = current.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> idle.copy(items = result.data)
                    is AppResult.Failure -> idle.copy(error = result.error)
                }
            }
        }
    }
}
