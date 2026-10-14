package com.schoolapp.core.network.dto.inventory

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class RequestLineDto(
    val itemId: String,
    val sku: String = "",
    val itemName: String = "",
    val unit: String = "",
    val quantity: Int = 0,
    val estimatedUnitMinor: Long = 0,
)

@Serializable
data class OrderSummaryDto(
    val id: String,
    val poNo: String = "",
    val vendor: IdNameDto? = null,
    val status: String? = null,
)

@Serializable
data class PurchaseRequestDto(
    val id: String,
    val requestNo: String? = null,
    val branchId: String? = null,
    val reason: String = "",
    val lines: List<RequestLineDto> = emptyList(),
    val estimatedTotalMinor: Long? = null,
    val status: String? = null,
    val requestedBy: IdNameDto? = null,
    val purchaseOrder: OrderSummaryDto? = null,
    val createdAt: String? = null,
)

@Serializable
data class OrderLineDto(
    val itemId: String,
    val itemName: String = "",
    val unit: String = "",
    val orderedQty: Int = 0,
    val receivedQty: Int = 0,
    val unitPriceMinor: Long = 0,
)

@Serializable
data class PurchaseOrderDto(
    val id: String,
    val poNo: String = "",
    val vendor: IdNameDto? = null,
    val status: String? = null,
    val totalMinor: Long? = null,
    val expectedOn: String? = null,
    val expenseId: String? = null,
    val lines: List<OrderLineDto> = emptyList(),
)
