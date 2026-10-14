package com.schoolapp.feature.inventory.components

import com.schoolapp.feature.inventory.R

/** Rows with their field errors set, plus an error for the list as a whole (none / duplicate items). */
internal data class CheckedLines(val lines: List<LineDraft>, val listError: Int?) {
    val valid: Boolean get() = listError == null && lines.none { it.itemError != null || it.quantityError != null || it.priceError != null }
}

/** Every row needs an item and a quantity of at least 1; [needsPrice] also asks for a valid amount. */
internal fun List<LineDraft>.check(needsPrice: Boolean): CheckedLines {
    val checked = map { line ->
        val qty = line.quantityValue
        line.copy(
            itemError = if (line.itemId == null) R.string.inv_err_item else null,
            quantityError = if (qty == null || qty < 1) R.string.inv_err_quantity else null,
            priceError = if (needsPrice && line.priceMinor == null) R.string.inv_err_price else null,
        )
    }
    val ids = mapNotNull { it.itemId }
    val listError = when {
        isEmpty() -> R.string.inv_err_lines
        ids.size != ids.toSet().size -> R.string.inv_err_duplicate
        else -> null
    }
    return CheckedLines(checked, listError)
}
