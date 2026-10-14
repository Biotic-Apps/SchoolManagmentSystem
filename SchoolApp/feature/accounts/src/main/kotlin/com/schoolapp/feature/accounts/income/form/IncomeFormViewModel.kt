package com.schoolapp.feature.accounts.income.form

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.accounts.AccountsRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeInput
import com.schoolapp.core.model.files.FilePurpose
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** "Record income" / "Edit income" sheet with an optional receipt upload. */
@HiltViewModel
class IncomeFormViewModel @Inject constructor(
    private val repository: AccountsRepository,
    private val filesRepository: FilesRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(IncomeFormUiState())
    val uiState: StateFlow<IncomeFormUiState> = _uiState.asStateFlow()

    /** Resets the form for [branchId]; [income] switches it to edit mode. */
    fun start(branchId: String, income: Income?) {
        _uiState.value = if (income == null) {
            IncomeFormUiState(isOpen = true, branchId = branchId, receivedOn = clock.now().toLocalDate().toString())
        } else {
            IncomeFormUiState(
                isOpen = true,
                branchId = branchId,
                editing = income,
                title = income.title,
                categoryId = income.category?.id,
                amount = MoneyFormat.toInput(income.amountMinor),
                receivedOn = income.receivedOn,
                description = income.description.orEmpty(),
                notes = income.notes.orEmpty(),
            )
        }
    }

    fun onTitle(text: String) = edit(IncomeField.TITLE) { it.copy(title = text) }

    fun onCategory(id: String?) = edit(IncomeField.CATEGORY) { it.copy(categoryId = id) }

    fun onAmount(text: String) = edit(IncomeField.AMOUNT) { it.copy(amount = text) }

    fun onDate(date: String) = edit(IncomeField.DATE) { it.copy(receivedOn = date) }

    fun onDescription(text: String) = edit(IncomeField.DESCRIPTION) { it.copy(description = text) }

    fun onNotes(text: String) = edit(IncomeField.NOTES) { it.copy(notes = text) }

    fun onReceiptPicked(uri: String) {
        val state = _uiState.value
        if (state.isSaving || !state.receipt.canAdd(MAX_RECEIPTS)) return
        _uiState.update { it.copy(receipt = it.receipt.started(), error = null) }
        viewModelScope.launch {
            val result = filesRepository.upload(uri, FilePurpose.DOCUMENT)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(receipt = current.receipt.added(result.data.toAttachment()))
                    is AppResult.Failure -> current.copy(receipt = current.receipt.failed(), error = result.error)
                }
            }
        }
    }

    fun onReceiptRemoved(id: String) = _uiState.update { it.copy(receipt = it.receipt.removed(id)) }

    fun close() = _uiState.update { if (it.isSaving) it else IncomeFormUiState() }

    /** The list took the saved record; the sheet closes. */
    fun consumeSaved() = _uiState.update { IncomeFormUiState() }

    fun submit() {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        if (state.isSaving || state.receipt.isUploading) return
        val errors = IncomeFormValidation.validate(state)
        val amount = MoneyFormat.parse(state.amount.trim())
        if (errors.isNotEmpty() || amount == null || state.categoryId == null) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        val input = IncomeInput(
            categoryId = state.categoryId,
            title = state.title.trim(),
            description = state.description.trim(),
            amountMinor = amount,
            receivedOn = state.receivedOn,
            receiptFileId = state.receipt.fileIds.firstOrNull() ?: state.editing?.receiptFileId,
            notes = state.notes.trim(),
        )
        _uiState.update { it.copy(isSaving = true, error = null, errors = emptyMap()) }
        viewModelScope.launch {
            val editing = state.editing
            val result = if (editing == null) repository.createIncome(branchId, input) else repository.updateIncome(editing.id, input)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(isSaving = false, saved = result.data)
                    is AppResult.Failure -> current.copy(isSaving = false, error = result.error)
                }
            }
        }
    }

    private fun edit(field: IncomeField, transform: (IncomeFormUiState) -> IncomeFormUiState) =
        _uiState.update { if (it.isSaving) it else transform(it).copy(errors = it.errors - field, error = null) }

    companion object {
        const val MAX_RECEIPTS = 1
    }
}
