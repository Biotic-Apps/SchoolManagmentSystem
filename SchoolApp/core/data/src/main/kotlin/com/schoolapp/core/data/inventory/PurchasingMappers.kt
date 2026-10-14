package com.schoolapp.core.data.inventory

import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.inventory.AssetInput
import com.schoolapp.core.model.inventory.ItemInput
import com.schoolapp.core.model.inventory.MovementInput
import com.schoolapp.core.model.inventory.PurchaseOrder
import com.schoolapp.core.model.inventory.PurchaseOrderInput
import com.schoolapp.core.model.inventory.PurchaseOrderLine
import com.schoolapp.core.model.inventory.PurchaseOrderStatus
import com.schoolapp.core.model.inventory.PurchaseOrderSummary
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.model.inventory.PurchaseRequestInput
import com.schoolapp.core.model.inventory.PurchaseRequestLine
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.core.model.inventory.QuantityLine
import com.schoolapp.core.network.dto.inventory.CreateAssetBody
import com.schoolapp.core.network.dto.inventory.CreateItemBody
import com.schoolapp.core.network.dto.inventory.MovementBody
import com.schoolapp.core.network.dto.inventory.OrderLineBody
import com.schoolapp.core.network.dto.inventory.PurchaseOrderBody
import com.schoolapp.core.network.dto.inventory.PurchaseOrderDto
import com.schoolapp.core.network.dto.inventory.PurchaseRequestBody
import com.schoolapp.core.network.dto.inventory.PurchaseRequestDto
import com.schoolapp.core.network.dto.inventory.QuantityLineBody
import com.schoolapp.core.network.dto.inventory.RequestLineBody

internal fun PurchaseRequestDto.toModel(): PurchaseRequest {
    val mapped = lines.map {
        PurchaseRequestLine(it.itemId, it.itemName, it.sku, it.unit, it.quantity, it.estimatedUnitMinor)
    }
    return PurchaseRequest(
        id = id,
        requestNo = requestNo,
        branchId = branchId,
        reason = reason,
        lines = mapped,
        estimatedTotalMinor = estimatedTotalMinor ?: mapped.sumOf { it.totalMinor },
        status = enumOrDefault(status, PurchaseRequestStatus.UNKNOWN),
        requestedBy = requestedBy?.name,
        createdAt = createdAt,
        order = purchaseOrder?.let {
            PurchaseOrderSummary(it.id, it.poNo, it.vendor?.name, enumOrDefault(it.status, PurchaseOrderStatus.UNKNOWN))
        },
    )
}

internal fun PurchaseOrderDto.toModel(): PurchaseOrder {
    val mapped = lines.map {
        PurchaseOrderLine(it.itemId, it.itemName, it.unit, it.orderedQty, it.receivedQty, it.unitPriceMinor)
    }
    return PurchaseOrder(
        id = id,
        poNo = poNo,
        vendorName = vendor?.name,
        status = enumOrDefault(status, PurchaseOrderStatus.UNKNOWN),
        totalMinor = totalMinor ?: mapped.sumOf { it.totalMinor },
        expectedOn = expectedOn,
        expenseId = expenseId,
        lines = mapped,
    )
}

internal fun ItemInput.toBody() = CreateItemBody(
    schoolId = schoolId,
    sku = sku,
    name = name,
    category = category.name,
    unit = unit,
    reorderLevel = reorderLevel,
    isAsset = isAsset,
    saleable = saleable,
    salePriceMinor = salePriceMinor.takeIf { saleable },
)

internal fun MovementInput.toBody() = MovementBody(branchId, itemId, type.name, quantity, toBranchId, issuedTo, reason)

internal fun AssetInput.toCreateBody(branchId: String) =
    CreateAssetBody(branchId, itemId, tag, location, condition.name, assignedTo)

internal fun PurchaseRequestInput.toBody() =
    PurchaseRequestBody(branchId, lines.map { RequestLineBody(it.itemId, it.quantity, it.unitMinor) }, reason)

internal fun PurchaseOrderInput.toBody() =
    PurchaseOrderBody(vendorId, lines.map { OrderLineBody(it.itemId, it.quantity, it.unitMinor) }, expectedOn)

internal fun List<QuantityLine>.toBodies() = map { QuantityLineBody(it.itemId, it.quantity) }
