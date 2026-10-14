package com.schoolapp.feature.expenses.detail

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpensePaymentMethod
import com.schoolapp.feature.expenses.common.ExpensePermissions

enum class ExpenseNotice { CREATED, UPDATED, SUBMITTED, PAID }

enum class PaymentError { AMOUNT_REQUIRED, AMOUNT_INVALID, AMOUNT_OVER_BALANCE, REFERENCE_TOO_LONG }

/** "Record payment" sheet; the amount starts at the outstanding balance (part payments allowed). */
data class PaymentFormState(
    val amount: String,
    val method: ExpensePaymentMethod = ExpensePaymentMethod.BANK,
    val paidOn: String,
    val reference: String = "",
    val amountError: PaymentError? = null,
    val referenceError: PaymentError? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

data class ExpenseDetailUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val expense: Expense? = null,
    val permissions: ExpensePermissions = ExpensePermissions(),
    val confirmSubmit: Boolean = false,
    val isSubmitting: Boolean = false,
    val actionError: AppError? = null,
    val payment: PaymentFormState? = null,
    val notice: ExpenseNotice? = null,
) {
    val canEdit: Boolean get() = expense?.isEditable == true && permissions.canEdit
    val canSubmit: Boolean get() = expense?.isEditable == true && permissions.canSubmit
    val canPay: Boolean get() = expense?.isPayable == true && permissions.canPay
}
