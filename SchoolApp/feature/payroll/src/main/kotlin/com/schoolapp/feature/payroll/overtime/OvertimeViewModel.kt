package com.schoolapp.feature.payroll.overtime

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.payroll.extras.PayrollExtrasRepository
import com.schoolapp.core.data.payroll.setup.PayrollSetupRepository
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.model.payroll.extras.OvertimeEntry
import com.schoolapp.core.model.payroll.extras.OvertimeInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.YearMonth
import javax.inject.Inject

/** Overtime of a branch month: found in attendance or added by hand; paid only after approval. */
@HiltViewModel
class OvertimeViewModel @Inject constructor(
    private val repository: PayrollExtrasRepository,
    private val setup: PayrollSetupRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val today: LocalDate = LocalDate.from(clock.now())
    private val _uiState = MutableStateFlow(OvertimeUiState(YearMonth.from(today), YearMonth.from(today)))
    val uiState: StateFlow<OvertimeUiState> = _uiState.asStateFlow()

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

    fun nextMonth() {
        if (_uiState.value.canGoNext) changeMonth(_uiState.value.month.plusMonths(1))
    }

    fun scan() {
        val branch = branchId ?: return
        if (_uiState.value.scanning) return
        _uiState.update { it.copy(scanning = true, notice = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.scanOvertime(branch, _uiState.value.month.toString())
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(scanning = false, notice = OvertimeNotice.Found(result.data))
                    is AppResult.Failure -> state.copy(scanning = false, actionError = result.error)
                }
            }
            if (result is AppResult.Success) load(refreshing = true)
        }
    }

    fun approveAll() {
        val ids = _uiState.value.pendingIds
        if (ids.isEmpty() || _uiState.value.approvingAll) return
        _uiState.update { it.copy(approvingAll = true) }
        decide(ids, approve = true)
    }

    fun decide(entry: OvertimeEntry, approve: Boolean) {
        if (_uiState.value.busyId != null) return
        _uiState.update { it.copy(busyId = entry.id) }
        decide(listOf(entry.id), approve)
    }

    fun askRemove(entry: OvertimeEntry) = _uiState.update { it.copy(confirmRemove = entry) }

    fun dismissRemove() = _uiState.update { it.copy(confirmRemove = null) }

    fun confirmRemove() {
        val entry = _uiState.value.confirmRemove ?: return
        _uiState.update { it.copy(confirmRemove = null, busyId = entry.id, notice = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.removeOvertime(entry.id)
            afterAction(result, OvertimeNotice.Removed)
        }
    }

    fun openForm() = _uiState.update { state ->
        val month = state.month
        val date = if (YearMonth.from(today) == month) today else month.atDay(1)
        state.copy(form = OvertimeForm(date = date.toString()), notice = null)
    }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun editForm(change: (OvertimeForm) -> OvertimeForm) = _uiState.update { state ->
        val form = state.form?.let(change) ?: return@update state
        state.copy(form = if (form.issues.isEmpty()) form else form.copy(issues = form.validate(state.month)))
    }

    fun saveForm() {
        val state = _uiState.value
        val form = state.form ?: return
        if (form.isSaving) return
        val issues = form.validate(state.month)
        if (issues.isNotEmpty()) {
            _uiState.update { it.copy(form = form.copy(issues = issues)) }
            return
        }
        _uiState.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            val input = OvertimeInput(checkNotNull(form.staffId), form.date, checkNotNull(form.minutes()), form.reason)
            when (val result = repository.addOvertime(input)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(form = null, notice = OvertimeNotice.Added) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(form = it.form?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    private fun decide(ids: List<String>, approve: Boolean) {
        _uiState.update { it.copy(notice = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.decideOvertime(ids, approve)
            afterAction(result, if (approve) OvertimeNotice.Approved else OvertimeNotice.Rejected)
        }
    }

    private fun afterAction(result: AppResult<Unit>, notice: OvertimeNotice) {
        _uiState.update { state ->
            val idle = state.copy(busyId = null, approvingAll = false)
            when (result) {
                is AppResult.Success -> idle.copy(notice = notice)
                is AppResult.Failure -> idle.copy(actionError = result.error)
            }
        }
        if (result is AppResult.Success) load(refreshing = true)
    }

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, data = null, notice = null, actionError = null) }
        load(refreshing = false)
    }

    private fun load(refreshing: Boolean) {
        val branch = branchId ?: return
        val month = _uiState.value.month
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val result = repository.overtime(branch, month.toString())
            _uiState.update { state ->
                if (state.month != month) return@update state
                val idle = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> idle.copy(data = result.data)
                    is AppResult.Failure -> idle.copy(error = result.error)
                }
            }
        }
    }
}
