package com.schoolapp.core.network.dto.inventory

import kotlinx.serialization.Serializable

@Serializable
data class CreateItemBody(
    val schoolId: String? = null,
    val sku: String,
    val name: String,
    val category: String,
    val unit: String,
    val reorderLevel: Int,
    val isAsset: Boolean,
    val saleable: Boolean,
    val salePriceMinor: Long? = null,
)

@Serializable
data class MovementBody(
    val branchId: String,
    val itemId: String,
    val type: String,
    val quantity: Int,
    val toBranchId: String? = null,
    val issuedTo: String? = null,
    val reason: String? = null,
)

@Serializable
data class CreateAssetBody(
    val branchId: String,
    val itemId: String,
    val tag: String,
    val location: String,
    val condition: String,
    val assignedTo: String? = null,
)

/** An empty [assignedTo] clears the assignee. */
@Serializable
data class UpdateAssetBody(val location: String, val condition: String, val assignedTo: String)

@Serializable
data class QuantityLineBody(val itemId: String, val quantity: Int)

@Serializable
data class RequestLineBody(val itemId: String, val quantity: Int, val estimatedUnitMinor: Long)

@Serializable
data class OrderLineBody(val itemId: String, val quantity: Int, val unitPriceMinor: Long)

@Serializable
data class PurchaseRequestBody(val branchId: String, val lines: List<RequestLineBody>, val reason: String)

@Serializable
data class PurchaseOrderBody(val vendorId: String, val lines: List<OrderLineBody>, val expectedOn: String? = null)

@Serializable
data class ReceiveBody(val receivedOn: String, val lines: List<QuantityLineBody>)

@Serializable
data class SaleBody(val studentId: String, val lines: List<QuantityLineBody>)

@Serializable
data class CreateVendorBody(val name: String, val schoolId: String? = null)
