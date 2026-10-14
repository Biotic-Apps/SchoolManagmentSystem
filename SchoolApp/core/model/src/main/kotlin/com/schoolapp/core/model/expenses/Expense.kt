package com.schoolapp.core.model.expenses

/** Bill lifecycle: DRAFT → SUBMITTED (approval) → APPROVED/REJECTED → PARTIALLY_PAID → PAID. */
enum class ExpenseStatus { DRAFT, SUBMITTED, APPROVED, REJECTED, PARTIALLY_PAID, PAID, UNKNOWN }

enum class ExpensePaymentMethod { CASH, BANK, CHEQUE }

/** Money is integer minor units (paisa). */
data class Expense(
    val id: String,
    val branchId: String?,
    val categoryId: String?,
    val categoryName: String?,
    val vendorId: String?,
    val vendorName: String?,
    val title: String,
    val amountMinor: Long,
    val paidMinor: Long,
    val balanceMinor: Long,
    val currency: String?,
    val billDate: String,
    val dueDate: String?,
    val billFileId: String?,
    val billUrl: String?,
    val recurringMonthly: Boolean,
    val recurringUntil: String?,
    /** True for a monthly copy generated from a recurring template (its schedule cannot change). */
    val isRecurringCopy: Boolean,
    val notes: String?,
    val status: ExpenseStatus,
    val payments: List<ExpensePayment>,
    val createdAt: String?,
) {
    /** Only drafts and rejected bills can be edited or (re)submitted. */
    val isEditable: Boolean get() = status == ExpenseStatus.DRAFT || status == ExpenseStatus.REJECTED

    val isPayable: Boolean
        get() = (status == ExpenseStatus.APPROVED || status == ExpenseStatus.PARTIALLY_PAID) && balanceMinor > 0
}

data class ExpensePayment(
    val id: String,
    val amountMinor: Long,
    val method: ExpensePaymentMethod?,
    val reference: String?,
    val paidOn: String,
)

/** A page of a server list plus the total row count. */
data class ExpensePage<T>(val items: List<T>, val total: Int, val page: Int, val pageSize: Int) {
    val hasMore: Boolean get() = page * pageSize < total
}
