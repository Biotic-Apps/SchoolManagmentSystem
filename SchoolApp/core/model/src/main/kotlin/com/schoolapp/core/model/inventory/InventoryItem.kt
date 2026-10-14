package com.schoolapp.core.model.inventory

/** A catalogue item (shared by every branch of the school); [stock]/[lowStock] are for the queried branch. */
data class InventoryItem(
    val id: String,
    val sku: String,
    val name: String,
    val category: ItemCategory?,
    val unit: String,
    val reorderLevel: Int,
    val isAsset: Boolean,
    val saleable: Boolean,
    val salePriceMinor: Long?,
    val stock: Int? = null,
    val lowStock: Boolean? = null,
)

/** Short item reference carried by stock rows, movements and assets. */
data class ItemRef(
    val id: String,
    val sku: String,
    val name: String,
    val unit: String,
    val category: ItemCategory?,
)

/** Current stock of one item in a branch; [low] when at or below the reorder level. */
data class StockLine(
    val item: ItemRef,
    val quantity: Int,
    val reorderLevel: Int?,
    val low: Boolean,
)

/** [quantity] is signed: + adds stock, − removes it. [createdAt] is an ISO timestamp. */
data class StockMovement(
    val id: String,
    val item: ItemRef,
    val type: MovementType?,
    val quantity: Int,
    val issuedTo: String?,
    val reason: String?,
    val performedBy: String?,
    val createdAt: String,
)

data class Asset(
    val id: String,
    val item: ItemRef,
    val tag: String,
    val location: String,
    val condition: AssetCondition?,
    val assignedTo: String?,
)

data class Vendor(val id: String, val name: String)

/** One page of a list plus whether more pages exist. */
data class InventoryPage<T>(val items: List<T>, val page: Int, val hasMore: Boolean)
