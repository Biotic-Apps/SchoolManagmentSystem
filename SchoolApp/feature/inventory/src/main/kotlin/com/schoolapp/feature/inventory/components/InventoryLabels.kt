package com.schoolapp.feature.inventory.components

import androidx.annotation.StringRes
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.inventory.AssetCondition
import com.schoolapp.core.model.inventory.ItemCategory
import com.schoolapp.core.model.inventory.MovementType
import com.schoolapp.core.model.inventory.PurchaseOrderStatus
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.feature.inventory.R

@StringRes
internal fun ItemCategory.label(): Int = when (this) {
    ItemCategory.FURNITURE -> R.string.inv_cat_furniture
    ItemCategory.COMPUTER -> R.string.inv_cat_computer
    ItemCategory.STATIONERY -> R.string.inv_cat_stationery
    ItemCategory.UNIFORM -> R.string.inv_cat_uniform
    ItemCategory.BOOK -> R.string.inv_cat_book
    ItemCategory.SPORTS -> R.string.inv_cat_sports
    ItemCategory.OTHER -> R.string.inv_cat_other
}

@StringRes
internal fun MovementType.label(): Int = when (this) {
    MovementType.IN -> R.string.inv_move_in
    MovementType.ISSUE -> R.string.inv_move_issue
    MovementType.ADJUST -> R.string.inv_move_adjust
    MovementType.TRANSFER_OUT -> R.string.inv_move_transfer_out
    MovementType.TRANSFER_IN -> R.string.inv_move_transfer_in
}

@StringRes
internal fun AssetCondition.label(): Int = when (this) {
    AssetCondition.NEW -> R.string.inv_cond_new
    AssetCondition.GOOD -> R.string.inv_cond_good
    AssetCondition.FAIR -> R.string.inv_cond_fair
    AssetCondition.POOR -> R.string.inv_cond_poor
    AssetCondition.DISPOSED -> R.string.inv_cond_disposed
}

internal fun AssetCondition.tone(): StatusTone = when (this) {
    AssetCondition.NEW, AssetCondition.GOOD -> StatusTone.Success
    AssetCondition.FAIR -> StatusTone.Info
    AssetCondition.POOR -> StatusTone.Warning
    AssetCondition.DISPOSED -> StatusTone.Neutral
}

@StringRes
internal fun PurchaseRequestStatus.label(): Int = when (this) {
    PurchaseRequestStatus.PENDING -> R.string.inv_status_pending
    PurchaseRequestStatus.APPROVED -> R.string.inv_status_approved
    PurchaseRequestStatus.REJECTED -> R.string.inv_status_rejected
    PurchaseRequestStatus.ORDERED -> R.string.inv_status_ordered
    PurchaseRequestStatus.UNKNOWN -> R.string.inv_status_unknown
}

internal fun PurchaseRequestStatus.tone(): StatusTone = when (this) {
    PurchaseRequestStatus.PENDING -> StatusTone.Warning
    PurchaseRequestStatus.APPROVED -> StatusTone.Success
    PurchaseRequestStatus.REJECTED -> StatusTone.Error
    PurchaseRequestStatus.ORDERED -> StatusTone.Info
    PurchaseRequestStatus.UNKNOWN -> StatusTone.Neutral
}

@StringRes
internal fun PurchaseOrderStatus.label(): Int = when (this) {
    PurchaseOrderStatus.ORDERED -> R.string.inv_status_ordered
    PurchaseOrderStatus.PARTIALLY_RECEIVED -> R.string.inv_status_partial
    PurchaseOrderStatus.RECEIVED -> R.string.inv_status_received
    PurchaseOrderStatus.BILLED -> R.string.inv_status_billed
    PurchaseOrderStatus.UNKNOWN -> R.string.inv_status_unknown
}

internal fun PurchaseOrderStatus.tone(): StatusTone = when (this) {
    PurchaseOrderStatus.ORDERED -> StatusTone.Info
    PurchaseOrderStatus.PARTIALLY_RECEIVED -> StatusTone.Warning
    PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.BILLED -> StatusTone.Success
    PurchaseOrderStatus.UNKNOWN -> StatusTone.Neutral
}
