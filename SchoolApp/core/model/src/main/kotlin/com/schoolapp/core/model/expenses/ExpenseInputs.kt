package com.schoolapp.core.model.expenses

/** Fields of `GET /expenses`; null means "any". */
data class ExpenseQuery(
    val branchId: String,
    val categoryId: String? = null,
    val status: ExpenseStatus? = null,
    val from: String? = null,
    val to: String? = null,
)

/** Create/update body; [branchId] is ignored on update. [recurringUntil] is `YYYY-MM`. */
data class ExpenseInput(
    val branchId: String,
    val categoryId: String,
    val vendorId: String?,
    val title: String,
    val amountMinor: Long,
    val billDate: String,
    val dueDate: String?,
    val billFileId: String?,
    val recurringMonthly: Boolean,
    val recurringUntil: String?,
    val notes: String?,
)

data class ExpensePaymentInput(
    val amountMinor: Long,
    val method: ExpensePaymentMethod,
    val reference: String?,
    val paidOn: String,
)

data class VendorInput(
    val name: String,
    val contactPerson: String?,
    val phone: String?,
    val email: String?,
    val address: String?,
    val ntn: String?,
)

data class ExpenseCategoryInput(val name: String, val code: String?)
