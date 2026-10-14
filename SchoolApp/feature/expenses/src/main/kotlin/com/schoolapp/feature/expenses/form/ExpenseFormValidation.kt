package com.schoolapp.feature.expenses.form

import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.expenses.ExpenseInput

internal const val MIN_TITLE = 2
internal const val MAX_TITLE = 150
internal const val MAX_NOTES = 1000

/** Same rules as the web form (and the API): title, category, amount > 0, due ≥ bill date, until ≥ bill month. */
internal fun ExpenseFormUiState.validate(): Map<ExpenseField, ExpenseFieldError> = buildMap {
    val trimmed = title.trim()
    when {
        trimmed.isEmpty() -> put(ExpenseField.TITLE, ExpenseFieldError.REQUIRED)
        trimmed.length < MIN_TITLE -> put(ExpenseField.TITLE, ExpenseFieldError.TOO_SHORT)
        trimmed.length > MAX_TITLE -> put(ExpenseField.TITLE, ExpenseFieldError.TOO_LONG)
    }
    if (categoryId == null) put(ExpenseField.CATEGORY, ExpenseFieldError.REQUIRED)
    val minor = MoneyFormat.parse(amount)
    when {
        amount.isBlank() -> put(ExpenseField.AMOUNT, ExpenseFieldError.REQUIRED)
        minor == null || minor <= 0 -> put(ExpenseField.AMOUNT, ExpenseFieldError.INVALID_AMOUNT)
    }
    if (billDate.isBlank()) put(ExpenseField.BILL_DATE, ExpenseFieldError.REQUIRED)
    val due = dueDate
    if (due != null && billDate.isNotBlank() && due < billDate) put(ExpenseField.DUE_DATE, ExpenseFieldError.DUE_BEFORE_BILL)
    val until = recurringUntil
    if (recurringMonthly && until != null && billDate.length >= MONTH && until < billDate.take(MONTH)) {
        put(ExpenseField.UNTIL, ExpenseFieldError.UNTIL_BEFORE_BILL)
    }
    if (notes.trim().length > MAX_NOTES) put(ExpenseField.NOTES, ExpenseFieldError.TOO_LONG)
}

internal fun ExpenseFormUiState.toInput(branchId: String) = ExpenseInput(
    branchId = branchId,
    categoryId = requireNotNull(categoryId),
    vendorId = vendorId,
    title = title.trim(),
    amountMinor = MoneyFormat.parse(amount) ?: 0,
    billDate = billDate,
    dueDate = dueDate,
    billFileId = billFile?.id,
    recurringMonthly = recurringMonthly,
    recurringUntil = if (recurringMonthly) recurringUntil else null,
    notes = notes.trim().ifEmpty { null },
)

private const val MONTH = 7
