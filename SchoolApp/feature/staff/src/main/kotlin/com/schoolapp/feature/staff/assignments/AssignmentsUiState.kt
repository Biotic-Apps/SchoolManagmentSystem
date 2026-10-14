package com.schoolapp.feature.staff.assignments

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.StaffAssignment

/** One-shot snackbar after a write. */
enum class AssignmentNotice { ADDED, ENDED }

@Immutable
data class AssignmentsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val sessions: List<SwitcherOption> = emptyList(),
    val sessionId: String? = null,
    val assignments: List<StaffAssignment> = emptyList(),
    val endTarget: StaffAssignment? = null,
    val isEnding: Boolean = false,
    val endError: AppError? = null,
    val add: AddAssignmentState? = null,
    val notice: AssignmentNotice? = null,
) {
    val hasSessions: Boolean get() = sessions.isNotEmpty()
}
