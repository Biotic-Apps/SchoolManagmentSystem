package com.schoolapp.feature.pickup.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonStatus

enum class ParentPickupMessage { PERSON_ADDED, LEAVE_REQUESTED }

@Immutable
data class ParentPickupUiState(
    val isLoading: Boolean = true,
    val childId: String? = null,
    val noChild: Boolean = false,
    val today: String = "",
    val persons: List<PickupPerson> = emptyList(),
    val earlyLeaves: List<EarlyLeave> = emptyList(),
    val error: AppError? = null,
    val personEditor: AddPersonEditor? = null,
    val leaveEditor: EarlyLeaveEditor? = null,
    val message: ParentPickupMessage? = null,
) {
    val verifiedPersons: List<PickupPerson> get() = persons.filter { it.status == PickupPersonStatus.VERIFIED }
}
