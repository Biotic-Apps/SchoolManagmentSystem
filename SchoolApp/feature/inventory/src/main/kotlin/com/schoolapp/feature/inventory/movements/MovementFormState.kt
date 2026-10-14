package com.schoolapp.feature.inventory.movements

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.inventory.MovementInput
import com.schoolapp.core.model.inventory.MovementType
import com.schoolapp.feature.inventory.R

enum class MovementField { ITEM, QUANTITY, TO_BRANCH, REASON }

/** "Record stock movement" sheet. ADJUST uses [remove] for the sign so the number stays positive. */
@Immutable
data class MovementFormState(
    val open: Boolean = false,
    val itemId: String? = null,
    val type: MovementType = MovementType.IN,
    val remove: Boolean = false,
    val quantity: String = "",
    val toBranchId: String? = null,
    val issuedTo: String = "",
    val reason: String = "",
    val inStock: Map<String, Int> = emptyMap(),
    val errors: Map<MovementField, Int> = emptyMap(),
    /** Server text for NEGATIVE_STOCK, shown under the quantity. */
    val quantityServerError: String? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val inStockHint: Int? get() = itemId?.let { inStock[it] }

    fun validate(): Map<MovementField, Int> = buildMap {
        if (itemId == null) put(MovementField.ITEM, R.string.inv_err_item)
        val qty = quantity.trim().toIntOrNull()
        if (qty == null || qty < 1) put(MovementField.QUANTITY, R.string.inv_err_quantity)
        if (type == MovementType.TRANSFER_OUT && toBranchId == null) put(MovementField.TO_BRANCH, R.string.inv_err_to_branch)
        if (type == MovementType.ADJUST && reason.isBlank()) put(MovementField.REASON, R.string.inv_err_reason_adjust)
    }

    fun toInput(branchId: String): MovementInput {
        val qty = quantity.trim().toInt()
        return MovementInput(
            branchId = branchId,
            itemId = itemId.orEmpty(),
            type = type,
            quantity = if (type == MovementType.ADJUST && remove) -qty else qty,
            toBranchId = toBranchId.takeIf { type == MovementType.TRANSFER_OUT },
            issuedTo = issuedTo.trim().takeIf { type == MovementType.ISSUE && it.isNotEmpty() },
            reason = reason.trim().takeIf { it.isNotEmpty() },
        )
    }
}
