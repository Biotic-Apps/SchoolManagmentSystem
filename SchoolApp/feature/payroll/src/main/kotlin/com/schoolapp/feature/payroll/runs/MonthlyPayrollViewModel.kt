package com.schoolapp.feature.payroll.runs

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.feature.payroll.runs.breakdown.BreakdownController
import com.schoolapp.feature.payroll.runs.payment.PaymentController
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/**
 * Monthly payroll of one branch: the month's run (or "create"), its gated workflow actions, staff lines,
 * per-line breakdown and salary payments. Opened from a run link (`runId` in the saved state) it shows that run.
 */
@HiltViewModel
class MonthlyPayrollViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: PayrollRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val runId: String? = savedStateHandle["runId"]
    private val current = YearMonth.from(clock.now())
    private val _uiState = MutableStateFlow(MonthlyPayrollUiState(month = current, currentMonth = current, fixedRun = runId != null))
    val uiState: StateFlow<MonthlyPayrollUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    val actions = RunActionsController(viewModelScope, repository, _uiState, ::reload)
    val payment = PaymentController(viewModelScope, repository, _uiState, { clock.now().toLocalDate() }, ::reload)
    val breakdown = BreakdownController(viewModelScope, repository, _uiState)

    init {
        if (runId != null) {
            viewModelScope.launch {
                authRepository.session.first()?.let { session -> _uiState.update { it.copy(permissions = session.payrollPermissions()) } }
                load(refreshing = false)
            }
        }
    }

    /** Tab entry: the branch to show (re-binding the same branch only refreshes the permissions). */
    fun bind(branchId: String, session: SessionContext) {
        _uiState.update { it.copy(permissions = session.payrollPermissions(), hasBranch = true) }
        if (this.branchId == branchId) return
        this.branchId = branchId
        _uiState.update { it.copy(run = null, staffType = null, notice = null, actionError = null) }
        load(refreshing = false)
    }

    fun onPreviousMonth() = changeMonth(_uiState.value.month.minusMonths(1))

    fun onNextMonth() {
        if (_uiState.value.canGoNext) changeMonth(_uiState.value.month.plusMonths(1))
    }

    fun onStaffType(type: String?) = _uiState.update { it.copy(staffType = type) }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun dismissNotice() = _uiState.update { it.copy(notice = null, actionError = null) }

    /** `payroll.add`: a new run for the month; 409 means one already exists, so the month is reloaded. */
    fun createRun() {
        val branch = branchId ?: return
        val state = _uiState.value
        if (state.creating || !state.permissions.canAdd) return
        _uiState.update { it.copy(creating = true, notice = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.createRun(branch, state.month.toString())
            val conflict = result is AppResult.Failure && (result.error as? AppError.Server)?.httpCode == HTTP_CONFLICT
            _uiState.update {
                when {
                    result is AppResult.Success -> it.copy(creating = false, notice = RunNotice.CREATED)
                    conflict -> it.copy(creating = false, notice = RunNotice.ALREADY_EXISTS)
                    else -> it.copy(creating = false, actionError = (result as AppResult.Failure).error)
                }
            }
            if (result is AppResult.Success || conflict) load(refreshing = true)
        }
    }

    private fun changeMonth(month: YearMonth) {
        _uiState.update { it.copy(month = month, run = null, staffType = null, notice = null, actionError = null, breakdown = null, payment = null) }
        load(refreshing = false)
    }

    private fun reload() = load(refreshing = true)

    private fun load(refreshing: Boolean) {
        val month = _uiState.value.month
        if (runId == null && branchId == null) return
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val result = fetch(month)
            _uiState.update { state ->
                if (runId == null && state.month != month) return@update state
                val base = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> {
                        val run = result.data
                        val fixedMonth = run?.month?.let { runCatching { YearMonth.parse(it.take(7)) }.getOrNull() }
                        base.copy(run = run, month = if (runId != null && fixedMonth != null) fixedMonth else base.month)
                    }
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    /** The month's run with its lines: the list call finds it, the detail call brings the lines. */
    private suspend fun fetch(month: YearMonth): AppResult<PayrollRun?> {
        runId?.let { id -> return repository.run(id) }
        val listed = when (val list = repository.runs(branchId, month.toString())) {
            is AppResult.Failure -> return list
            is AppResult.Success -> list.data.firstOrNull { it.month.startsWith(month.toString()) } ?: list.data.firstOrNull()
        } ?: return AppResult.Success(null)
        return repository.run(listed.id)
    }

    private companion object {
        const val HTTP_CONFLICT = 409
    }
}

internal fun SessionContext.payrollPermissions() = PayrollPermissions(
    canAdd = has("payroll.add"),
    canEdit = has("payroll.edit"),
    canApprove = has("payroll.approve"),
)
