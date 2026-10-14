package com.schoolapp.feature.inventory.assets

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.inventory.Asset
import com.schoolapp.core.model.inventory.AssetCondition
import com.schoolapp.core.model.inventory.AssetInput
import com.schoolapp.feature.inventory.R

enum class AssetField { ITEM, TAG, LOCATION }

/** Add/edit asset sheet. An edit keeps the item and tag (the API changes location, condition and assignee only). */
@Immutable
data class AssetFormState(
    val open: Boolean = false,
    val editing: Asset? = null,
    val itemId: String? = null,
    val tag: String = "",
    val location: String = "",
    val condition: AssetCondition = AssetCondition.NEW,
    val assignedTo: String = "",
    val errors: Map<AssetField, Int> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(): Map<AssetField, Int> = buildMap {
        if (itemId == null) put(AssetField.ITEM, R.string.inv_err_item)
        if (tag.isBlank()) put(AssetField.TAG, R.string.inv_err_tag)
        if (location.isBlank()) put(AssetField.LOCATION, R.string.inv_err_location)
    }

    fun toInput() = AssetInput(
        itemId = itemId.orEmpty(),
        tag = tag.trim().uppercase(),
        location = location.trim(),
        condition = condition,
        assignedTo = assignedTo.trim().takeIf { it.isNotEmpty() },
    )

    companion object {
        fun from(asset: Asset?) = AssetFormState(
            open = true,
            editing = asset,
            itemId = asset?.item?.id,
            tag = asset?.tag.orEmpty(),
            location = asset?.location.orEmpty(),
            condition = asset?.condition ?: AssetCondition.NEW,
            assignedTo = asset?.assignedTo.orEmpty(),
        )
    }
}
