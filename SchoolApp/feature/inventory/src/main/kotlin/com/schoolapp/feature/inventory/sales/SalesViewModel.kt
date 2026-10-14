package com.schoolapp.feature.inventory.sales

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.inventory.QuantityLine
import com.schoolapp.core.model.inventory.SaleInput
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.inventory.R
import com.schoolapp.feature.inventory.components.LineDraft
import com.schoolapp.feature.inventory.components.SavedMessage
import com.schoolapp.feature.inventory.components.check
import com.schoolapp.feature.inventory.components.edit
import com.schoolapp.feature.inventory.components.isNegativeStock
import com.schoolapp.feature.inventory.components.nextKey
import com.schoolapp.feature.inventory.components.serverMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Uniform / book sale: issues stock and adds the lines to the student's fee invoice. */
@HiltViewModel
class SalesViewModel @Inject constructor(
    private val inventoryRepository: InventoryRepository,
    private val studentsRepository: StudentsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SalesUiState())
    val uiState: StateFlow<SalesUiState> = _uiState.asStateFlow()

    private val _saved = Channel<SavedMessage>(Channel.BUFFERED)
    val saved: Flow<SavedMessage> = _saved.receiveAsFlow()

    private var searchJob: Job? = null

    fun onSearch(text: String) {
        _uiState.update { it.copy(search = text, searchError = null) }
        searchJob?.cancel()
        val query = text.trim()
        if (query.length < MIN_QUERY) {
            _uiState.update { it.copy(results = emptyList(), isSearching = false) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            _uiState.update { it.copy(isSearching = true) }
            val result = studentsRepository.students(search = query)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isSearching = false, results = result.data.take(MAX_RESULTS))
                    is AppResult.Failure -> it.copy(isSearching = false, searchError = result.error)
                }
            }
        }
    }

    fun onStudent(student: StudentSummary) {
        searchJob?.cancel()
        _uiState.update { it.copy(student = student, search = "", results = emptyList(), isSearching = false, studentMissing = false, error = null) }
    }

    fun onClearStudent() = _uiState.update { it.copy(student = null) }

    fun addLine() = _uiState.update { it.copy(lines = it.lines + LineDraft(it.lines.nextKey()), linesError = null) }

    fun removeLine(key: Int) = _uiState.update { state ->
        if (state.lines.size <= 1) state else state.copy(lines = state.lines.filterNot { it.key == key }, linesError = null, stockError = null)
    }

    fun onItem(key: Int, id: String?) = editLine(key) { it.copy(itemId = id, itemError = null) }

    fun onQuantity(key: Int, value: String) = editLine(key) { it.copy(quantity = value, quantityError = null) }

    fun submit() {
        val state = _uiState.value
        if (state.isSaving) return
        val checked = state.lines.check(needsPrice = false)
        val student = state.student
        if (!checked.valid || student == null) {
            _uiState.update { it.copy(lines = checked.lines, linesError = checked.listError, studentMissing = student == null) }
            return
        }
        val input = SaleInput(student.id, state.lines.map { QuantityLine(it.itemId.orEmpty(), it.quantityValue ?: 0) })
        _uiState.update { it.copy(isSaving = true, error = null, stockError = null) }
        viewModelScope.launch {
            when (val result = inventoryRepository.recordSale(input)) {
                is AppResult.Success -> {
                    _uiState.value = SalesUiState()
                    val invoice = result.data.invoiceNo
                    _saved.send(if (invoice != null) SavedMessage(R.string.inv_sale_saved_invoice, invoice) else SavedMessage(R.string.inv_sale_saved))
                }
                is AppResult.Failure -> _uiState.update {
                    val message = result.error.serverMessage
                    if (result.error.isNegativeStock && message != null) {
                        it.copy(isSaving = false, stockError = message)
                    } else {
                        it.copy(isSaving = false, error = result.error)
                    }
                }
            }
        }
    }

    private fun editLine(key: Int, change: (LineDraft) -> LineDraft) =
        _uiState.update { it.copy(lines = it.lines.edit(key, change), linesError = null, stockError = null, error = null) }

    private companion object {
        const val MIN_QUERY = 2
        const val MAX_RESULTS = 8
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}
