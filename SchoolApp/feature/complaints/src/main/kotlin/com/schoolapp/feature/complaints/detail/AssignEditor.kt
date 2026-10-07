package com.schoolapp.feature.complaints.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.staff.StaffSummary

/** Staff login a complaint can be handed to. */
@Immutable
data class AssigneeOption(val userId: String, val name: String, val designation: String?)

/** Supervisor "Assign": pick one active staff login (never the person the complaint is about). */
@Immutable
data class AssignEditor(
    val candidates: List<AssigneeOption> = emptyList(),
    val currentAssigneeId: String? = null,
    val query: String = "",
    val selectedUserId: String? = null,
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val selectionMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val visible: List<AssigneeOption>
        get() {
            val q = query.trim()
            if (q.isEmpty()) return candidates
            return candidates.filter { it.name.contains(q, ignoreCase = true) || it.designation?.contains(q, ignoreCase = true) == true }
        }
}

/** Active staff with a login, minus [againstUserId]; sorted by name. */
internal fun List<StaffSummary>.toAssigneeOptions(againstUserId: String?): List<AssigneeOption> =
    filter { it.status == null || it.status == ACTIVE }
        .mapNotNull { staff -> staff.userId?.takeIf { it != againstUserId }?.let { AssigneeOption(it, staff.name, staff.designation) } }
        .distinctBy { it.userId }
        .sortedBy { it.name.lowercase() }

private const val ACTIVE = "ACTIVE"
