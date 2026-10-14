package com.schoolapp.feature.expenses.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.expenses.ExpensesRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.expenses.ExpensePaymentInput
import com.schoolapp.core.model.expenses.ExpensePaymentMethod
import com.schoolapp.feature.expenses.UPDATED_KEY
import com.schoolapp.feature.expenses.common.ExpensePermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One bill: details, payments, submit for approval and record payment. */
@HiltViewModel
class ExpenseDetailViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val repository: ExpensesRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val expenseId: String = checkNotNull(savedStateHandle["expenseId"])

    /** School of the bill's branch; the edit form needs it for a global admin's category/vendor lists. */
    val schoolId: String? = savedStateHandle["schoolId"]

    private val _uiState = MutableStateFlow(
        ExpenseDetailUiState(notice = if (savedStateHandle.get<Boolean>("created") == true) ExpenseNotice.CREATED else null),
    )
    val uiState: StateFlow<ExpenseDetailUiState> = _uiState.asStateFlow()

    init {
        savedStateHandle["created"] = false
        load()
    }

    /** Called on resume: reloads after the edit form saved. */
    fun onResume() {
        if (savedStateHandle.get<Boolean>(UPDATED_KEY) != true) return
        savedStateHandle[UPDATED_KEY] = false
        _uiState.update { it.copy(notice = ExpenseNotice.UPDATED) }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.expense == null, isRefreshing = it.expense != null, error = null) }
        viewModelScope.launch {
            val permissions = ExpensePermissions.of(authRepository.session.first())
            val result = repository.expense(expenseId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, expense = result.data, permissions = permissions)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error, permissions = permissions)
                }
            }
        }
    }

    fun consumeNotice() = _uiState.update { it.copy(notice = null) }

    fun askSubmit() = _uiState.update { it.copy(confirmSubmit = true, actionError = null) }

    fun dismissSubmit() = _uiState.update { it.copy(confirmSubmit = false) }

    fun submit() {
        if (_uiState.value.isSubmitting) return
        _uiState.update { it.copy(confirmSubmit = false, isSubmitting = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.submit(expenseId)) {
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, expense = result.data, notice = ExpenseNotice.SUBMITTED) }
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, actionError = result.error) }
            }
        }
    }

    fun openPayment() {
        val expense = _uiState.value.expense ?: return
        val form = PaymentFormState(amount = MoneyFormat.toInput(expense.balanceMinor), paidOn = clock.now().toLocalDate().toString())
        _uiState.update { it.copy(payment = form, actionError = null) }
    }

    fun closePayment() = _uiState.update { if (it.payment?.isSaving == true) it else it.copy(payment = null) }

    fun onPaymentAmount(text: String) = updatePayment { it.copy(amount = text, amountError = null) }

    fun onPaymentMethod(method: ExpensePaymentMethod) = updatePayment { it.copy(method = method) }

    fun onPaymentDate(date: String) = updatePayment { it.copy(paidOn = date) }

    fun onPaymentReference(text: String) = updatePayment { it.copy(reference = text, referenceError = null) }

    fun recordPayment() {
        val state = _uiState.value
        val form = state.payment ?: return
        val balance = state.expense?.balanceMinor ?: return
        if (form.isSaving) return
        val minor = MoneyFormat.parse(form.amount)
        val amountError = when {
            form.amount.isBlank() -> PaymentError.AMOUNT_REQUIRED
            minor == null || minor <= 0 -> PaymentError.AMOUNT_INVALID
            minor > balance -> PaymentError.AMOUNT_OVER_BALANCE
            else -> null
        }
        val referenceError = if (form.reference.trim().length > MAX_REFERENCE) PaymentError.REFERENCE_TOO_LONG else null
        if (amountError != null || referenceError != null || minor == null) {
            updatePayment { it.copy(amountError = amountError, referenceError = referenceError) }
            return
        }
        updatePayment { it.copy(isSaving = true) }
        val input = ExpensePaymentInput(minor, form.method, form.reference.trim().ifEmpty { null }, form.paidOn)
        viewModelScope.launch {
            when (val result = repository.recordPayment(expenseId, input)) {
                is AppResult.Success -> _uiState.update { it.copy(payment = null, expense = result.data, notice = ExpenseNotice.PAID) }
                is AppResult.Failure -> updatePayment { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun updatePayment(transform: (PaymentFormState) -> PaymentFormState) = _uiState.update { state ->
        state.payment?.let { state.copy(payment = transform(it.copy(error = null))) } ?: state
    }

    private companion object {
        const val MAX_REFERENCE = 100
    }
}
