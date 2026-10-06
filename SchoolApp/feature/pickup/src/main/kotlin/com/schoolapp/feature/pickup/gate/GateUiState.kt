package com.schoolapp.feature.pickup.gate

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.feature.pickup.components.StudentSearchState

/** Today's gate desk; [canEdit] (`pickup.edit`) enables approve/reject and recording departures. */
@Immutable
data class GateUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val today: String = "",
    val canEdit: Boolean = false,
    val earlyLeaves: List<EarlyLeave> = emptyList(),
    val departures: List<Departure> = emptyList(),
    val error: AppError? = null,
    val actionError: AppError? = null,
    val busyLeaveId: String? = null,
    val search: StudentSearchState = StudentSearchState(),
) {
    /** ISO time the student left today, if a departure was recorded. */
    fun departedAt(studentId: String): String? = departures.firstOrNull { it.studentId == studentId }?.at
}
