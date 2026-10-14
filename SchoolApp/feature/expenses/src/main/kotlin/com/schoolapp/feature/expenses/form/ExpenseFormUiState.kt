package com.schoolapp.feature.expenses.form

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.expenses.ExpenseCategory
import com.schoolapp.core.model.expenses.Vendor
import com.schoolapp.core.model.files.Attachment

enum class ExpenseField { TITLE, CATEGORY, AMOUNT, BILL_DATE, DUE_DATE, UNTIL, NOTES }

enum class ExpenseFieldError { REQUIRED, TOO_SHORT, TOO_LONG, INVALID_AMOUNT, DUE_BEFORE_BILL, UNTIL_BEFORE_BILL }

data class ExpenseFormUiState(
    val isEditing: Boolean = false,
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val categories: List<ExpenseCategory> = emptyList(),
    val vendors: List<Vendor> = emptyList(),
    val canCreateLookups: Boolean = false,
    val creatingLookup: Boolean = false,
    val title: String = "",
    val categoryId: String? = null,
    val vendorId: String? = null,
    /** Name of the saved vendor when it is not among the first page of vendors. */
    val vendorFallback: String? = null,
    val categoryFallback: String? = null,
    val amount: String = "",
    val billDate: String = "",
    val dueDate: String? = null,
    val billFile: Attachment? = null,
    val isUploading: Boolean = false,
    val recurringMonthly: Boolean = false,
    /** `YYYY-MM`; null repeats until stopped. */
    val recurringUntil: String? = null,
    /** Monthly copies keep the template's schedule; a saved schedule cannot be switched off (API rule). */
    val recurringLocked: Boolean = false,
    /** The API cannot clear a saved vendor or due date, so the "none" choice is hidden once one is saved. */
    val vendorLocked: Boolean = false,
    val notes: String = "",
    val errors: Map<ExpenseField, ExpenseFieldError> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val isBusy: Boolean get() = isSaving || isUploading || creatingLookup
}
