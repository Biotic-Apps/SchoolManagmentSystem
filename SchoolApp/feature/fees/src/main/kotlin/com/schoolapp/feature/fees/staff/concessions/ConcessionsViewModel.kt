package com.schoolapp.feature.fees.staff.concessions

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.ledger.FeesLedgerRepository
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.data.fees.structure.FeeStructureRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.ledger.Concession
import com.schoolapp.core.model.fees.ledger.ConcessionInput
import com.schoolapp.core.model.fees.ledger.ConcessionType
import com.schoolapp.core.model.fees.ledger.RequestStatus
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.feature.fees.components.StudentSearch
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

enum class ConcessionIssue { STUDENT, VALUE, TO, REASON }

@Immutable
data class ConcessionForm(
    val feeHeadId: String? = null,
    val type: ConcessionType = ConcessionType.PERCENT,
    val percent: String = "",
    val amount: String = "",
    val from: YearMonth,
    val to: YearMonth? = null,
    val reason: String = "",
    val issues: Set<ConcessionIssue> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun value(): Long? = when (type) {
        ConcessionType.PERCENT -> percent.trim().toLongOrNull()?.takeIf { it in 1..100 }
        ConcessionType.FIXED -> MoneyFormat.parse(amount)?.takeIf { it > 0 }
    }

    fun validate(hasStudent: Boolean): Set<ConcessionIssue> = buildSet {
        if (!hasStudent) add(ConcessionIssue.STUDENT)
        if (value() == null) add(ConcessionIssue.VALUE)
        if (to != null && to < from) add(ConcessionIssue.TO)
        if (reason.trim().length !in 3..500) add(ConcessionIssue.REASON)
    }
}

@Immutable
data class ConcessionsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val status: RequestStatus? = null,
    val items: List<Concession>? = null,
    val heads: List<FeeHead> = emptyList(),
    val form: ConcessionForm? = null,
    val sent: Boolean = false,
)

/** Concessions of the branch and the request form (sent for approval). */
@HiltViewModel
class ConcessionsViewModel @Inject constructor(
    private val repository: FeesLedgerRepository,
    private val structure: FeeStructureRepository,
    students: StudentsRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ConcessionsUiState())
    val uiState: StateFlow<ConcessionsUiState> = _uiState.asStateFlow()
    val studentSearch = StudentSearch(students, viewModelScope)

    private var branch: FinanceBranch? = null
    private var loadJob: Job? = null

    fun start(branch: FinanceBranch) {
        if (this.branch?.id == branch.id) return
        this.branch = branch
        load(refreshing = false)
        viewModelScope.launch {
            (structure.feeHeads(branch.schoolId) as? AppResult.Success)?.let { heads ->
                _uiState.update { it.copy(heads = heads.data.filterNot { head -> head.system }) }
            }
        }
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun onStatus(status: RequestStatus?) {
        _uiState.update { it.copy(status = status) }
        load(refreshing = false)
    }

    fun openForm() {
        studentSearch.clear()
        _uiState.update { it.copy(form = ConcessionForm(from = YearMonth.from(clock.now())), sent = false) }
    }

    fun dismissForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun edit(change: (ConcessionForm) -> ConcessionForm) = _uiState.update { state ->
        val form = state.form?.let(change) ?: return@update state
        val hasStudent = studentSearch.state.value.selected != null
        state.copy(form = if (form.issues.isEmpty()) form else form.copy(issues = form.validate(hasStudent)))
    }

    fun send() {
        val form = _uiState.value.form ?: return
        if (form.isSaving) return
        val student = studentSearch.state.value.selected
        val issues = form.validate(student != null)
        if (issues.isNotEmpty() || student == null) return _uiState.update { it.copy(form = form.copy(issues = issues)) }
        _uiState.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            val input = ConcessionInput(
                studentId = student.id,
                feeHeadId = form.feeHeadId,
                type = form.type,
                value = checkNotNull(form.value()),
                from = form.from.toString(),
                to = form.to?.toString(),
                reason = form.reason,
            )
            when (val result = repository.requestConcession(input)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(form = null, sent = true) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(form = it.form?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        val current = branch ?: return
        val status = _uiState.value.status
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val result = repository.concessions(current.id, status)
            _uiState.update { state ->
                if (state.status != status) return@update state
                val idle = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> idle.copy(items = result.data)
                    is AppResult.Failure -> idle.copy(error = result.error)
                }
            }
        }
    }
}
