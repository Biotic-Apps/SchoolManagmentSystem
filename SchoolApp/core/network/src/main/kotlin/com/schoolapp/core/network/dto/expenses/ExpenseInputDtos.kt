package com.schoolapp.core.network.dto.expenses

import kotlinx.serialization.Serializable

/** `POST /expenses`; nulls are omitted on the wire. */
@Serializable
data class CreateExpenseDto(
    val branchId: String,
    val categoryId: String,
    val vendorId: String? = null,
    val title: String,
    val amountMinor: Long,
    val billDate: String,
    val dueDate: String? = null,
    val billFileId: String? = null,
    val recurring: RecurringInputDto? = null,
    val notes: String? = null,
)

/** `PATCH /expenses/:id`; omitted fields stay as they are. */
@Serializable
data class UpdateExpenseDto(
    val categoryId: String,
    val vendorId: String? = null,
    val title: String,
    val amountMinor: Long,
    val billDate: String,
    val dueDate: String? = null,
    val billFileId: String? = null,
    val recurring: RecurringInputDto? = null,
    val notes: String? = null,
)

@Serializable
data class RecurringInputDto(val monthly: Boolean = true, val untilMonth: String? = null)

@Serializable
data class ExpensePaymentInputDto(
    val amountMinor: Long,
    val method: String,
    val reference: String? = null,
    val paidOn: String,
)

@Serializable
data class CreateVendorDto(
    val schoolId: String? = null,
    val name: String,
    val contactPerson: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val address: String? = null,
    val ntn: String? = null,
)

@Serializable
data class CreateExpenseCategoryDto(val schoolId: String? = null, val name: String, val code: String? = null)
