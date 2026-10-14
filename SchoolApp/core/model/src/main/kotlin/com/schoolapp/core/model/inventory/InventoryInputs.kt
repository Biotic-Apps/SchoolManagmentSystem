package com.schoolapp.core.model.inventory

data class ItemInput(
    val schoolId: String?,
    val sku: String,
    val name: String,
    val category: ItemCategory,
    val unit: String,
    val reorderLevel: Int,
    val isAsset: Boolean,
    val saleable: Boolean,
    val salePriceMinor: Long?,
)

data class MovementInput(
    val branchId: String,
    val itemId: String,
    val type: MovementType,
    val quantity: Int,
    val toBranchId: String?,
    val issuedTo: String?,
    val reason: String?,
)

/** Create needs every field; an edit sends only location, condition and assignee (tag and item are fixed). */
data class AssetInput(
    val itemId: String,
    val tag: String,
    val location: String,
    val condition: AssetCondition,
    val assignedTo: String?,
)

data class QuantityLine(val itemId: String, val quantity: Int)

data class PricedLine(val itemId: String, val quantity: Int, val unitMinor: Long)

data class PurchaseRequestInput(val branchId: String, val lines: List<PricedLine>, val reason: String)

data class PurchaseOrderInput(val vendorId: String, val lines: List<PricedLine>, val expectedOn: String?)

data class ReceiveInput(val receivedOn: String, val lines: List<QuantityLine>)

data class SaleInput(val studentId: String, val lines: List<QuantityLine>)

data class SaleResult(val invoiceNo: String?, val totalMinor: Long)
