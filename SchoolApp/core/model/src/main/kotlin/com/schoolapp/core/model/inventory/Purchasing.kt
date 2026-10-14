package com.schoolapp.core.model.inventory

data class PurchaseRequestLine(
    val itemId: String,
    val itemName: String,
    val sku: String,
    val unit: String,
    val quantity: Int,
    val estimatedUnitMinor: Long,
) {
    val totalMinor: Long get() = quantity * estimatedUnitMinor
}

data class PurchaseRequest(
    val id: String,
    val requestNo: String?,
    val branchId: String?,
    val reason: String,
    val lines: List<PurchaseRequestLine>,
    val estimatedTotalMinor: Long,
    val status: PurchaseRequestStatus,
    val requestedBy: String?,
    val createdAt: String?,
    val order: PurchaseOrderSummary?,
)

/** The order as nested in a request: enough for the list; open [PurchaseOrder] for totals and billing. */
data class PurchaseOrderSummary(val id: String, val poNo: String, val vendorName: String?, val status: PurchaseOrderStatus)

data class PurchaseOrderLine(
    val itemId: String,
    val itemName: String,
    val unit: String,
    val orderedQty: Int,
    val receivedQty: Int,
    val unitPriceMinor: Long,
) {
    val outstanding: Int get() = (orderedQty - receivedQty).coerceAtLeast(0)
    val totalMinor: Long get() = orderedQty * unitPriceMinor
}

data class PurchaseOrder(
    val id: String,
    val poNo: String,
    val vendorName: String?,
    val status: PurchaseOrderStatus,
    val totalMinor: Long,
    val expectedOn: String?,
    val expenseId: String?,
    val lines: List<PurchaseOrderLine>,
) {
    val billed: Boolean get() = status == PurchaseOrderStatus.BILLED || expenseId != null
    val hasOutstanding: Boolean get() = lines.any { it.outstanding > 0 }
}
