package com.schoolapp.feature.pickup.departure

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.Picker

/** The gate refused [pickerName] (`PICKUP_NOT_AUTHORIZED`); the principal has been alerted. */
@Immutable
data class BlockedPickup(val pickerId: String, val pickerName: String, val message: String?)

@Immutable
data class RecordDepartureUiState(
    val studentId: String = "",
    val studentName: String? = null,
    val leaveTime: String? = null,
    val isLoading: Boolean = true,
    val pickers: List<Picker> = emptyList(),
    val error: AppError? = null,
    val selectedPickerId: String? = null,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val blocked: BlockedPickup? = null,
    val recorded: Departure? = null,
) {
    val selectedPicker: Picker? get() = pickers.firstOrNull { it.id == selectedPickerId }
}
