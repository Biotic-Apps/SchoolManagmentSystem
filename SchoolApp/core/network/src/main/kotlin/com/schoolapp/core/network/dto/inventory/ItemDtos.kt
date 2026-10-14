package com.schoolapp.core.network.dto.inventory

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ItemDto(
    val id: String,
    val sku: String = "",
    val name: String = "",
    val category: String? = null,
    val unit: String = "",
    val reorderLevel: Int = 0,
    val isAsset: Boolean = false,
    val saleable: Boolean = false,
    val salePriceMinor: Long? = null,
    val stock: Int? = null,
    val lowStock: Boolean? = null,
)

@Serializable
data class ItemRefDto(
    val id: String? = null,
    val sku: String? = null,
    val name: String? = null,
    val unit: String? = null,
    val category: String? = null,
)

@Serializable
data class StockRowDto(
    val item: ItemRefDto? = null,
    val itemId: String? = null,
    val quantity: Int = 0,
    val reorderLevel: Int? = null,
    val lowStock: Boolean? = null,
)

@Serializable
data class MovementDto(
    val id: String,
    val item: ItemRefDto? = null,
    val itemId: String? = null,
    val type: String? = null,
    val quantity: Int = 0,
    val issuedTo: String? = null,
    val reason: String? = null,
    val performedBy: IdNameDto? = null,
    val createdAt: String = "",
)

@Serializable
data class AssetDto(
    val id: String,
    val item: ItemRefDto? = null,
    val itemId: String? = null,
    val tag: String = "",
    val location: String = "",
    val condition: String? = null,
    val assignedTo: String? = null,
)

@Serializable
data class VendorDto(val id: String, val name: String = "")

@Serializable
data class SaleDto(val invoiceNo: String? = null, val totalMinor: Long = 0)
