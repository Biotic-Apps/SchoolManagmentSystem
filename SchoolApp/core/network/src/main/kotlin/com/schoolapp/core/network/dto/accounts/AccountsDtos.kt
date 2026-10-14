package com.schoolapp.core.network.dto.accounts

import kotlinx.serialization.Serializable

@Serializable
data class IncomeCategoryDto(val id: String = "", val name: String = "", val code: String? = null)

@Serializable
data class IncomeCategoryRequest(val name: String, val code: String? = null)

@Serializable
data class IncomeDto(
    val id: String = "",
    val branchId: String? = null,
    val categoryId: String? = null,
    val category: IncomeCategoryDto? = null,
    val title: String = "",
    val description: String? = null,
    val amountMinor: Long = 0,
    val currency: String? = null,
    val receivedOn: String = "",
    val receiptFileId: String? = null,
    val receiptUrl: String? = null,
    val notes: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class CreateIncomeRequest(
    val branchId: String,
    val categoryId: String,
    val title: String,
    val description: String? = null,
    val amountMinor: Long,
    val receivedOn: String,
    val receiptFileId: String? = null,
    val notes: String? = null,
)

/** PATCH body; null fields are left out (explicitNulls = false). */
@Serializable
data class UpdateIncomeRequest(
    val categoryId: String? = null,
    val title: String? = null,
    val description: String? = null,
    val amountMinor: Long? = null,
    val receivedOn: String? = null,
    val receiptFileId: String? = null,
    val notes: String? = null,
)

@Serializable
data class ProfitLossLineDto(val section: String = "", val item: String = "", val amountMinor: Long = 0)

@Serializable
data class ProfitLossDto(
    val from: String = "",
    val to: String = "",
    val totalIncomeMinor: Long = 0,
    val totalExpensesMinor: Long = 0,
    val netMinor: Long = 0,
    val lines: List<ProfitLossLineDto> = emptyList(),
)
