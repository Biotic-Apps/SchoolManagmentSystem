package com.schoolapp.core.network.dto.expenses

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ExpenseDto(
    val id: String,
    val branchId: String? = null,
    val categoryId: String? = null,
    val category: ExpenseCategoryDto? = null,
    val vendorId: String? = null,
    val vendor: IdNameDto? = null,
    val title: String = "",
    val amountMinor: Long = 0,
    val paidMinor: Long? = null,
    val balanceMinor: Long? = null,
    val currency: String? = null,
    val billDate: String = "",
    val dueDate: String? = null,
    val billFileId: String? = null,
    val billUrl: String? = null,
    val recurring: RecurringDto? = null,
    val recurringParentId: String? = null,
    val notes: String? = null,
    val status: String? = null,
    val payments: List<ExpensePaymentDto> = emptyList(),
    val createdAt: String? = null,
)

@Serializable
data class RecurringDto(val monthly: Boolean = false, val untilMonth: String? = null)

@Serializable
data class ExpensePaymentDto(
    val id: String,
    val amountMinor: Long = 0,
    val method: String? = null,
    val reference: String? = null,
    val paidOn: String = "",
)

@Serializable
data class ExpenseCategoryDto(val id: String, val name: String = "", val code: String? = null)

@Serializable
data class VendorDto(
    val id: String,
    val name: String = "",
    val contactPerson: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val address: String? = null,
    val ntn: String? = null,
)
