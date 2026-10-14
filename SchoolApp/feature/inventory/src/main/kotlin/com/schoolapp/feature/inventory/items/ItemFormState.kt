package com.schoolapp.feature.inventory.items

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.core.model.inventory.ItemInput
import com.schoolapp.feature.inventory.R

enum class ItemField { SKU, NAME, CATEGORY, UNIT, REORDER, PRICE }

/** "Add item" sheet; same rules as the web form and `POST /inventory/items`. */
@Immutable
data class ItemFormState(
    val open: Boolean = false,
    val sku: String = "",
    val name: String = "",
    val category: ItemCategory? = null,
    val unit: String = "piece",
    val reorderLevel: String = "0",
    val isAsset: Boolean = false,
    val saleable: Boolean = false,
    val salePrice: String = "",
    val errors: Map<ItemField, Int> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(): Map<ItemField, Int> = buildMap {
        if (!SKU.matches(sku.trim())) put(ItemField.SKU, R.string.inv_err_sku)
        if (name.trim().length !in NAME_LENGTH) put(ItemField.NAME, R.string.inv_err_name)
        if (category == null) put(ItemField.CATEGORY, R.string.inv_err_category)
        if (unit.trim().length !in UNIT_LENGTH) put(ItemField.UNIT, R.string.inv_err_unit)
        val reorder = reorderLevel.trim().toIntOrNull()
        if (reorder == null || reorder !in 0..MAX_REORDER) put(ItemField.REORDER, R.string.inv_err_reorder)
        if (saleable && (MoneyFormat.parse(salePrice) ?: 0L) < 1L) put(ItemField.PRICE, R.string.inv_err_price)
    }

    fun toInput(schoolId: String?) = ItemInput(
        schoolId = schoolId,
        sku = sku.trim().uppercase(),
        name = name.trim(),
        category = category ?: ItemCategory.OTHER,
        unit = unit.trim(),
        reorderLevel = reorderLevel.trim().toInt(),
        isAsset = isAsset,
        saleable = saleable,
        salePriceMinor = if (saleable) MoneyFormat.parse(salePrice) else null,
    )

    private companion object {
        val SKU = Regex("^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$")
        val NAME_LENGTH = 2..120
        val UNIT_LENGTH = 1..20
        const val MAX_REORDER = 1_000_000
    }
}
