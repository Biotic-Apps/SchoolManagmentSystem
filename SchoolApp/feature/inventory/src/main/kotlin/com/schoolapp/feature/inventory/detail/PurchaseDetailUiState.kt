package com.schoolapp.feature.inventory.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.inventory.PurchaseOrder
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.feature.inventory.shell.InventoryRights

/** A purchase request with its purchase order (if any) and the actions the role may take next. */
@Immutable
data class PurchaseDetailUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val request: PurchaseRequest? = null,
    val order: PurchaseOrder? = null,
    val rights: InventoryRights = InventoryRights(),
    val confirmBill: Boolean = false,
    val isBilling: Boolean = false,
    val actionError: AppError? = null,
) {
    val canOrder: Boolean
        get() = request?.status == PurchaseRequestStatus.APPROVED && request.order == null && rights.canEdit

    val canReceive: Boolean
        get() = order != null && !order.billed && order.hasOutstanding && rights.canEdit

    val canBill: Boolean
        get() = order != null && !order.billed && rights.canBill
}
