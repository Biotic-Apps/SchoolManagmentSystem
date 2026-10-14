package com.schoolapp.feature.expenses.form

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.expenses.ExpensesRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpenseCategoryInput
import com.schoolapp.core.model.expenses.VendorInput
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.feature.expenses.common.ExpensePermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Add a bill (saved as a draft) or edit a draft/rejected one; the bill copy is uploaded first. */
@HiltViewModel
class ExpenseFormViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ExpensesRepository,
    private val filesRepository: FilesRepository,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val branchId: String = checkNotNull(savedStateHandle["branchId"])
    val schoolId: String? = savedStateHandle["schoolId"]
    private val expenseId: String? = savedStateHandle["expenseId"]

    private val _uiState = MutableStateFlow(
        ExpenseFormUiState(isEditing = expenseId != null, billDate = clock.now().toLocalDate().toString()),
    )
    val uiState: StateFlow<ExpenseFormUiState> = _uiState.asStateFlow()

    private val _saved = MutableStateFlow<Expense?>(null)
    /** Set once the bill is saved; the route then leaves the form. */
    val saved: StateFlow<Expense?> = _saved.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val permissions = ExpensePermissions.of(authRepository.session.first())
            val categories = async { repository.categories(schoolId) }
            val vendors = async { repository.vendors(schoolId, null, 1, LOOKUP_PAGE) }
            val existing = expenseId?.let { id -> async { repository.expense(id) } }
            val categoryResult = categories.await()
            val vendorResult = vendors.await()
            val expenseResult = existing?.await()
            val failure = listOfNotNull(categoryResult, vendorResult, expenseResult).filterIsInstance<AppResult.Failure>().firstOrNull()
            if (failure != null) {
                _uiState.update { it.copy(isLoading = false, loadError = failure.error) }
                return@launch
            }
            val expense = expenseResult?.dataOrNull()
            _uiState.update { state ->
                val base = state.copy(
                    isLoading = false,
                    categories = categoryResult.dataOrNull().orEmpty(),
                    vendors = vendorResult.dataOrNull()?.items.orEmpty(),
                    canCreateLookups = permissions.canAdd,
                )
                expense?.let { base.filledFrom(it) } ?: base
            }
        }
    }

    fun onTitleChange(text: String) = edit { it.copy(title = text, errors = it.errors - ExpenseField.TITLE) }

    fun onCategoryChange(id: String?) = edit { it.copy(categoryId = id, errors = it.errors - ExpenseField.CATEGORY) }

    fun onVendorChange(id: String?) = edit { it.copy(vendorId = id) }

    fun onAmountChange(text: String) = edit { it.copy(amount = text, errors = it.errors - ExpenseField.AMOUNT) }

    fun onBillDateChange(date: String) =
        edit { it.copy(billDate = date, errors = it.errors - ExpenseField.BILL_DATE - ExpenseField.DUE_DATE - ExpenseField.UNTIL) }

    fun onDueDateChange(date: String?) = edit { it.copy(dueDate = date, errors = it.errors - ExpenseField.DUE_DATE) }

    fun onRecurringChange(on: Boolean) = edit {
        if (it.recurringLocked) it else it.copy(recurringMonthly = on, recurringUntil = if (on) it.recurringUntil else null)
    }

    fun onUntilChange(month: String?) = edit { it.copy(recurringUntil = month, errors = it.errors - ExpenseField.UNTIL) }

    fun onNotesChange(text: String) = edit { it.copy(notes = text, errors = it.errors - ExpenseField.NOTES) }

    fun onRemoveBill(@Suppress("UNUSED_PARAMETER") id: String) = edit { it.copy(billFile = null) }

    fun onBillPicked(uri: String) {
        if (_uiState.value.isBusy) return
        _uiState.update { it.copy(isUploading = true, error = null) }
        viewModelScope.launch {
            val result = filesRepository.upload(uri, FilePurpose.DOCUMENT)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isUploading = false, billFile = result.data.toAttachment())
                    is AppResult.Failure -> state.copy(isUploading = false, error = result.error)
                }
            }
        }
    }

    /** Inline "Create “name”" from the category picker. */
    fun createCategory(name: String) = createLookup {
        when (val result = repository.createCategory(schoolId, ExpenseCategoryInput(name.trim(), null))) {
            is AppResult.Success -> _uiState.update { state ->
                state.copy(categories = (state.categories + result.data).sortedBy { it.name.lowercase() }, categoryId = result.data.id, errors = state.errors - ExpenseField.CATEGORY)
            }
            is AppResult.Failure -> _uiState.update { it.copy(error = result.error) }
        }
    }

    /** Inline "Create “name”" from the vendor picker (name only; details can be added from Vendors). */
    fun createVendor(name: String) = createLookup {
        val input = VendorInput(name.trim(), null, null, null, null, null)
        when (val result = repository.createVendor(schoolId, input)) {
            is AppResult.Success -> _uiState.update { state ->
                state.copy(vendors = (state.vendors + result.data).sortedBy { it.name.lowercase() }, vendorId = result.data.id)
            }
            is AppResult.Failure -> _uiState.update { it.copy(error = result.error) }
        }
    }

    fun save() {
        val state = _uiState.value
        if (state.isBusy || state.isLoading) return
        val errors = state.validate()
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, errors = emptyMap(), error = null) }
        val input = state.toInput(branchId)
        viewModelScope.launch {
            val result = if (expenseId == null) repository.create(input) else repository.update(expenseId, input)
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isSaving = false) }
                    _saved.value = result.data
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun createLookup(block: suspend () -> Unit) {
        if (_uiState.value.isBusy) return
        _uiState.update { it.copy(creatingLookup = true, error = null) }
        viewModelScope.launch {
            block()
            _uiState.update { it.copy(creatingLookup = false) }
        }
    }

    private fun edit(transform: (ExpenseFormUiState) -> ExpenseFormUiState) = _uiState.update { transform(it).copy(error = null) }

    private companion object {
        const val LOOKUP_PAGE = 100
    }
}

private fun <T> AppResult<T>.dataOrNull(): T? = (this as? AppResult.Success<T>)?.data

private fun ExpenseFormUiState.filledFrom(expense: Expense) = copy(
    title = expense.title,
    categoryId = expense.categoryId,
    categoryFallback = expense.categoryName,
    vendorId = expense.vendorId,
    vendorFallback = expense.vendorName,
    vendorLocked = expense.vendorId != null,
    amount = MoneyFormat.toInput(expense.amountMinor),
    billDate = expense.billDate,
    dueDate = expense.dueDate,
    billFile = expense.billFileId?.let { Attachment(it, expense.billUrl, null, null) },
    recurringMonthly = expense.recurringMonthly,
    recurringUntil = expense.recurringUntil,
    recurringLocked = expense.isRecurringCopy || expense.recurringMonthly,
    notes = expense.notes.orEmpty(),
)
