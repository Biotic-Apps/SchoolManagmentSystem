package com.schoolapp.feature.fees.staff.invoices

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.invoices.InvoiceAdminRepository
import com.schoolapp.core.data.fees.invoices.InvoiceFilter
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.fees.InvoiceStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/** Invoices of a branch with filters, draft selection and issue, generation and bulk challan printing. */
@HiltViewModel
class InvoicesViewModel @Inject constructor(
    private val repository: InvoiceAdminRepository,
    private val organisation: OrganisationRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(InvoicesUiState(currentMonth = YearMonth.from(clock.now())))
    val uiState: StateFlow<InvoicesUiState> = _uiState.asStateFlow()

    private var branch: FinanceBranch? = null
    private var loadJob: Job? = null

    fun start(branch: FinanceBranch) {
        if (this.branch?.id == branch.id) return
        this.branch = branch
        load(refreshing = false)
        viewModelScope.launch {
            val classes = organisation.classes(branch.schoolId)
            val sessions = organisation.sessions(branch.id)
            _uiState.update { state ->
                state.copy(
                    classes = (classes as? AppResult.Success)?.data?.sortedBy { it.levelOrder ?: Int.MAX_VALUE } ?: state.classes,
                    sessions = (sessions as? AppResult.Success)?.data ?: state.sessions,
                )
            }
        }
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun onStatus(status: InvoiceStatus?) = applyFilter { it.copy(status = status) }

    fun onClass(classId: String?) = applyFilter { it.copy(classId = classId) }

    fun onPeriod(month: YearMonth?) = applyFilter { it.copy(period = month?.toString()) }

    fun onSearch(text: String) {
        _uiState.update { it.copy(search = text) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            _uiState.update { it.copy(filter = it.filter.copy(search = text)) }
            fetch(refreshing = false)
        }
    }

    // Draft selection and issue
    fun toggleSelecting() = _uiState.update { it.copy(selecting = !it.selecting, selected = emptySet(), notice = null) }

    fun toggle(id: String) = _uiState.update { it.copy(selected = if (id in it.selected) it.selected - id else it.selected + id) }

    fun issueSelected() {
        val ids = _uiState.value.selected.toList()
        if (ids.isEmpty() || _uiState.value.issuing) return
        _uiState.update { it.copy(issuing = true, actionError = null, notice = null) }
        viewModelScope.launch {
            when (val result = repository.issue(ids)) {
                is AppResult.Success -> {
                    _uiState.update {
                        it.copy(
                            issuing = false, selecting = false, selected = emptySet(),
                            notice = InvoicesNotice.Issued(result.data.issued, result.data.failures),
                        )
                    }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(issuing = false, actionError = result.error) }
            }
        }
    }

    // Generate
    fun openGenerate() = _uiState.update { state ->
        val session = state.sessions.firstOrNull { it.isActive } ?: state.sessions.firstOrNull()
        state.copy(generate = GenerateSheet(sessionId = session?.id, month = state.currentMonth), notice = null)
    }

    fun editGenerate(change: (GenerateSheet) -> GenerateSheet) = _uiState.update { state ->
        state.copy(generate = state.generate?.let(change)?.copy(sessionMissing = false))
    }

    fun dismissGenerate() = _uiState.update { if (it.generate?.running == true) it else it.copy(generate = null) }

    fun runGenerate() {
        val current = branch ?: return
        val sheet = _uiState.value.generate ?: return
        if (sheet.running) return
        val sessionId = sheet.sessionId ?: return _uiState.update { it.copy(generate = sheet.copy(sessionMissing = true)) }
        _uiState.update { it.copy(generate = sheet.copy(running = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.generate(current.id, sessionId, sheet.month.toString(), sheet.classIds.toList())) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(generate = null, notice = InvoicesNotice.Generated(result.data)) }
                    load(refreshing = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(generate = it.generate?.copy(running = false, error = result.error)) }
            }
        }
    }

    // Print challans
    fun openPrint() = _uiState.update { it.copy(print = PrintSheet(month = it.currentMonth), notice = null) }

    fun dismissPrint() = _uiState.update { if (it.print?.running == true) it else it.copy(print = null) }

    fun editPrint(change: (PrintSheet) -> PrintSheet) = _uiState.update { state -> state.copy(print = state.print?.let(change)) }

    fun onPrintClass(classId: String?) {
        editPrint { it.copy(classId = classId, sectionId = null, sections = emptyList()) }
        val current = branch ?: return
        if (classId == null) return
        viewModelScope.launch {
            val session = _uiState.value.sessions.firstOrNull { it.isActive }?.id
            (organisation.sections(current.id, session) as? AppResult.Success)?.data?.let { all ->
                editPrint { sheet -> if (sheet.classId == classId) sheet.copy(sections = all.filter { it.classId == classId }) else sheet }
            }
        }
    }

    fun runPrint() {
        val current = branch ?: return
        val sheet = _uiState.value.print ?: return
        if (sheet.running) return
        _uiState.update { it.copy(print = sheet.copy(running = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.printChallans(current.id, sheet.month.toString(), sheet.classId, sheet.sectionId)) {
                is AppResult.Success -> _uiState.update { it.copy(print = null, urlToOpen = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(print = it.print?.copy(running = false, error = result.error)) }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(urlToOpen = null) }

    private fun applyFilter(change: (InvoiceFilter) -> InvoiceFilter) {
        _uiState.update { it.copy(filter = change(it.filter), invoices = null) }
        load(refreshing = false)
    }

    private fun load(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch { fetch(refreshing) }
    }

    private suspend fun fetch(refreshing: Boolean) {
        val current = branch ?: return
        val filter = _uiState.value.filter
        _uiState.update { it.copy(isLoading = !refreshing && it.invoices == null, isRefreshing = refreshing, error = null) }
        val result = repository.invoices(current.id, filter)
        _uiState.update { state ->
            if (state.filter != filter) return@update state
            val idle = state.copy(isLoading = false, isRefreshing = false)
            when (result) {
                is AppResult.Success -> idle.copy(invoices = result.data)
                is AppResult.Failure -> idle.copy(error = result.error, invoices = null)
            }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}
