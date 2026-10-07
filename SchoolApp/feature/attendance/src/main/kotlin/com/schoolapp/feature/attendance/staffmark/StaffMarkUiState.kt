package com.schoolapp.feature.attendance.staffmark

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.model.attendance.StaffRosterEntry
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.feature.attendance.register.RegisterCounts

/** Unsaved changes to one staff row; null fields keep the saved value. */
@Immutable
data class StaffEdit(
    val status: AttendanceStatus? = null,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val remark: String? = null,
    /** Set when times were removed (absent / leave, or "Clear times"), so the saved times are dropped too. */
    val timesCleared: Boolean = false,
)

@Immutable
data class StaffRowUi(
    val staffId: String,
    val name: String,
    val designation: String?,
    val photoUrl: String?,
    val status: AttendanceStatus?,
    val checkIn: String?,
    val checkOut: String?,
    val remark: String?,
) {
    /** Times only apply to a status that means the person came in. */
    val timesEnabled: Boolean get() = status != null && status !in NO_TIMES

    companion object {
        val NO_TIMES = setOf(AttendanceStatus.ABSENT, AttendanceStatus.LEAVE)
    }
}

enum class StaffMarkMessage { SAVED }

@Immutable
data class StaffMarkUiState(
    /** The active role holds `attendance.approve` (as on web, the Staff tab needs it). */
    val canMark: Boolean = false,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val branches: List<BranchOption> = emptyList(),
    val branchId: String? = null,
    val date: String = "",
    val today: String = "",
    val entries: List<StaffRosterEntry> = emptyList(),
    val edits: Map<String, StaffEdit> = emptyMap(),
    val isSaving: Boolean = false,
    val actionError: AppError? = null,
    val message: StaffMarkMessage? = null,
    /** Staff id whose check times and remark are being edited. */
    val detailsFor: String? = null,
) {
    val rows: List<StaffRowUi> get() = entries.map { it.withEdit(edits[it.staffId]) }

    val dirty: Boolean get() = edits.isNotEmpty()

    val details: StaffRowUi? get() = detailsFor?.let { id -> rows.firstOrNull { it.staffId == id } }

    /** Several branches to choose from (global roles); branch-bound roles see none. */
    val showBranchPicker: Boolean get() = branches.size > 1

    val counts: RegisterCounts
        get() {
            val statuses = rows.map { it.status }
            return RegisterCounts(
                present = statuses.count { it == AttendanceStatus.PRESENT },
                absent = statuses.count { it == AttendanceStatus.ABSENT },
                late = statuses.count { it == AttendanceStatus.LATE },
                leave = statuses.count { it == AttendanceStatus.LEAVE },
                halfDay = statuses.count { it == AttendanceStatus.HALF_DAY },
                unmarked = statuses.count { it == null },
            )
        }

    /** Every marked row (the API upserts what it is sent, so saved rows are re-sent unchanged). */
    val marksToSave: List<StaffMark>
        get() = rows.mapNotNull { row ->
            row.status?.let { StaffMark(row.staffId, it, row.checkIn, row.checkOut, row.remark?.trim()?.ifEmpty { null }) }
        }
}

internal fun StaffRosterEntry.withEdit(edit: StaffEdit?): StaffRowUi {
    val cleared = edit?.timesCleared == true
    return StaffRowUi(
        staffId = staffId,
        name = name,
        designation = designation,
        photoUrl = photoUrl,
        status = edit?.status ?: status,
        checkIn = edit?.checkIn ?: checkIn.takeUnless { cleared },
        checkOut = edit?.checkOut ?: checkOut.takeUnless { cleared },
        remark = edit?.remark ?: remark,
    )
}
