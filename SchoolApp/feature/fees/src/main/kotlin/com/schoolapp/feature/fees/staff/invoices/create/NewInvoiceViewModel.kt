package com.schoolapp.feature.fees.staff.invoices.create

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.invoices.AdhocLine
import com.schoolapp.core.data.fees.invoices.InvoiceAdminRepository
import com.schoolapp.core.data.fees.structure.FeeStructureRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.feature.fees.components.StudentSearch
import com.schoolapp.feature.fees.staff.invoices.NewInvoiceDestination
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@Immutable
data class InvoiceLineRow(val key: Int, val feeHeadId: String? = null, val description: String = "", val amount: String = "")

enum class LineIssue { HEAD, DESCRIPTION, AMOUNT }

@Immutable
data class NewInvoiceUiState(
    val heads: List<FeeHead> = emptyList(),
    val headsError: AppError? = null,
    val dueDate: String,
    val lines: List<InvoiceLineRow> = listOf(InvoiceLineRow(0)),
    val nextKey: Int = 1,
    val showIssues: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
    val createdId: String? = null,
) {
    fun lineIssues(): Map<Int, Set<LineIssue>> = lines.mapNotNull { line ->
        val issues = buildSet {
            if (line.feeHeadId == null) add(LineIssue.HEAD)
            if (line.description.isBlank()) add(LineIssue.DESCRIPTION)
            if ((MoneyFormat.parse(line.amount) ?: 0L) <= 0L) add(LineIssue.AMOUNT)
        }
        issues.takeIf { it.isNotEmpty() }?.let { line.key to it }
    }.toMap()

    val totalMinor: Long get() = lines.sumOf { MoneyFormat.parse(it.amount) ?: 0L }
}

/** A one-off draft invoice for one student (e.g. books, a trip); it is issued like any draft. */
@HiltViewModel
class NewInvoiceViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: InvoiceAdminRepository,
    private val structure: FeeStructureRepository,
    students: StudentsRepository,
    clock: AppClock,
) : ViewModel() {

    private val schoolId = savedStateHandle.toRoute<NewInvoiceDestination>().schoolId
    private val _uiState = MutableStateFlow(NewInvoiceUiState(dueDate = LocalDate.from(clock.now()).plusDays(DUE_IN_DAYS).toString()))
    val uiState: StateFlow<NewInvoiceUiState> = _uiState.asStateFlow()
    val studentSearch = StudentSearch(students, viewModelScope)

    init {
        viewModelScope.launch {
            when (val result = structure.feeHeads(schoolId)) {
                is AppResult.Success -> _uiState.update { it.copy(heads = result.data.filterNot { head -> head.system }.sortedBy { head -> head.name }) }
                is AppResult.Failure -> _uiState.update { it.copy(headsError = result.error) }
            }
        }
    }

    fun onDueDate(date: String) = _uiState.update { it.copy(dueDate = date) }

    fun editLine(key: Int, change: (InvoiceLineRow) -> InvoiceLineRow) = _uiState.update { state ->
        state.copy(lines = state.lines.map { if (it.key == key) change(it) else it })
    }

    fun onHead(key: Int, headId: String?) = editLine(key) { line ->
        val name = _uiState.value.heads.firstOrNull { it.id == headId }?.name
        line.copy(feeHeadId = headId, description = line.description.ifBlank { name.orEmpty() })
    }

    fun addLine() = _uiState.update { it.copy(lines = it.lines + InvoiceLineRow(it.nextKey), nextKey = it.nextKey + 1) }

    fun removeLine(key: Int) = _uiState.update { it.copy(lines = it.lines.filterNot { line -> line.key == key }) }

    fun save() {
        val state = _uiState.value
        if (state.isSaving) return
        val student = studentSearch.state.value.selected
        if (student == null || state.lines.isEmpty() || state.lineIssues().isNotEmpty()) {
            _uiState.update { it.copy(showIssues = true) }
            return
        }
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val lines = state.lines.map { AdhocLine(checkNotNull(it.feeHeadId), it.description, MoneyFormat.parse(it.amount) ?: 0L) }
            when (val result = repository.create(student.id, state.dueDate, lines)) {
                is AppResult.Success -> _uiState.update { it.copy(isSaving = false, createdId = result.data.id) }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private companion object {
        const val DUE_IN_DAYS = 10L
    }
}
