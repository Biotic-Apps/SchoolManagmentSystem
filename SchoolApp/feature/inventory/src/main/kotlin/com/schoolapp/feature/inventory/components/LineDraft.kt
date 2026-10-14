package com.schoolapp.feature.inventory.components

import androidx.compose.runtime.Immutable
import com.schoolapp.core.designsystem.money.MoneyFormat

/** One editable "item × quantity (× price)" row of a request, order or sale form; [key] keeps rows stable. */
@Immutable
data class LineDraft(
    val key: Int,
    val itemId: String? = null,
    val quantity: String = "1",
    val price: String = "",
    val itemError: Int? = null,
    val quantityError: Int? = null,
    val priceError: Int? = null,
) {
    val quantityValue: Int? get() = quantity.trim().toIntOrNull()
    val priceMinor: Long? get() = MoneyFormat.parse(price)

    /** Quantity × typed price; 0 while either is missing. */
    val totalMinor: Long get() = (quantityValue ?: 0).toLong() * (priceMinor ?: 0L)

    fun clearErrors() = copy(itemError = null, quantityError = null, priceError = null)
}

/** Replaces the row with [key]. */
internal fun List<LineDraft>.edit(key: Int, change: (LineDraft) -> LineDraft): List<LineDraft> =
    map { if (it.key == key) change(it) else it }

internal fun List<LineDraft>.nextKey(): Int = (maxOfOrNull { it.key } ?: 0) + 1
