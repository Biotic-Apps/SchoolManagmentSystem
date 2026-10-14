package com.schoolapp.core.data.inventory

import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.core.model.inventory.AssetCondition
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.core.model.inventory.MovementType
import com.schoolapp.core.model.inventory.InventoryItem
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.core.model.inventory.ItemRef
import com.schoolapp.core.model.inventory.StockLine
import com.schoolapp.core.model.inventory.StockMovement
import com.schoolapp.core.model.inventory.Vendor
import com.schoolapp.core.network.dto.inventory.AssetDto
import com.schoolapp.core.network.dto.inventory.ItemDto
import com.schoolapp.core.network.dto.inventory.ItemRefDto
import com.schoolapp.core.network.dto.inventory.MovementDto
import com.schoolapp.core.network.dto.inventory.StockRowDto
import com.schoolapp.core.network.dto.inventory.VendorDto
import com.schoolapp.core.network.model.ApiEnvelope

internal fun ItemDto.toModel() = InventoryItem(
    id = id,
    sku = sku,
    name = name,
    category = enumOrNull<ItemCategory>(category),
    unit = unit,
    reorderLevel = reorderLevel,
    isAsset = isAsset,
    saleable = saleable,
    salePriceMinor = salePriceMinor,
    stock = stock,
    lowStock = lowStock,
)

internal fun ItemRefDto?.toModel(fallbackId: String?) = ItemRef(
    id = this?.id ?: fallbackId.orEmpty(),
    sku = this?.sku.orEmpty(),
    name = this?.name.orEmpty(),
    unit = this?.unit.orEmpty(),
    category = enumOrNull<ItemCategory>(this?.category),
)

internal fun StockRowDto.toModel(): StockLine {
    val reorder = reorderLevel
    return StockLine(
        item = item.toModel(itemId),
        quantity = quantity,
        reorderLevel = reorder,
        low = lowStock ?: (reorder != null && quantity <= reorder),
    )
}

internal fun MovementDto.toModel() = StockMovement(
    id = id,
    item = item.toModel(itemId),
    type = enumOrNull<MovementType>(type),
    quantity = quantity,
    issuedTo = issuedTo,
    reason = reason,
    performedBy = performedBy?.name,
    createdAt = createdAt,
)

internal fun AssetDto.toModel() = Asset(
    id = id,
    item = item.toModel(itemId),
    tag = tag,
    location = location,
    condition = enumOrNull<AssetCondition>(condition),
    assignedTo = assignedTo?.takeIf { it.isNotBlank() },
)

internal fun VendorDto.toModel() = Vendor(id, name)

/** Wraps a page; more pages exist while the server total says so (or the page came back full). */
internal fun <D, M> ApiEnvelope<List<D>>.toPage(page: Int, pageSize: Int, map: (D) -> M): InventoryPage<M> {
    val total = meta?.total
    val hasMore = if (total != null) page * pageSize < total else data.size >= pageSize
    return InventoryPage(data.map(map), page, hasMore)
}
