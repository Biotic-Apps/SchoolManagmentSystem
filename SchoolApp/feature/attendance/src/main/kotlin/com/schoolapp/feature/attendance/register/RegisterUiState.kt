package com.schoolapp.feature.attendance.register

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.attendance.AttendanceRegister
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.model.health.HealthAlert

enum class RegisterAction { DRAFT, SUBMIT }

enum class RegisterMessage { DRAFT_SAVED, SUBMITTED, QUEUED, PENDING_REVIEW, LOCKED, CORRECTION_SENT }

/**
 * The save/submit attempt in flight or last failed: retrying the same action with the same marks reuses
 * [clientRequestId] so the server applies it once; any change or a completed attempt gets a new id.
 */
@Immutable
data class PendingAttempt(
    val action: RegisterAction,
    val clientRequestId: String,
    val marks: Map<String, AttendanceStatus>,
)

/** `409 ALREADY_SUBMITTED`: the server register is shown; [myMarks] are kept for comparison. */
@Immutable
data class RegisterConflict(
    val submittedBy: String?,
    val myMarks: Map<String, AttendanceStatus>,
    val comparing: Boolean = false,
)

@Immutable
data class CorrectionEditor(
    val entryId: String,
    val studentName: String,
    val current: AttendanceStatus?,
    val newStatus: AttendanceStatus? = null,
    val reason: String = "",
    val isSaving: Boolean = false,
    val statusMissing: Boolean = false,
    val reasonMissing: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class RosterEntryUi(
    val studentId: String,
    val entryId: String?,
    val name: String,
    val rollNo: Int?,
    val photoUrl: String?,
    val status: AttendanceStatus?,
    val remark: String?,
    val onLeave: Boolean,
    val alert: HealthAlert?,
    /** Set while comparing after a conflict and this student's mark differs from the server. */
    val myStatus: AttendanceStatus? = null,
    val differs: Boolean = false,
)

@Immutable
data class RegisterCounts(
    val present: Int = 0,
    val absent: Int = 0,
    val late: Int = 0,
    val leave: Int = 0,
    val halfDay: Int = 0,
    val unmarked: Int = 0,
)

@Immutable
data class RegisterUiState(
    val title: String = "",
    val date: String = "",
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val register: AttendanceRegister? = null,
    val marks: Map<String, AttendanceStatus> = emptyMap(),
    val alerts: Map<String, HealthAlert> = emptyMap(),
    val offline: Boolean = false,
    val hasUnsentChanges: Boolean = false,
    val syncState: RegisterSyncState = RegisterSyncState.NONE,
    val isHelper: Boolean = false,
    val canEdit: Boolean = false,
    val canSubmit: Boolean = false,
    val canRequestCorrection: Boolean = false,
    val busyAction: RegisterAction? = null,
    val pendingAttempt: PendingAttempt? = null,
    val actionError: AppError? = null,
    val message: RegisterMessage? = null,
    val unmarkedBlocking: Int? = null,
    val confirmSubmit: Boolean = false,
    val conflict: RegisterConflict? = null,
    val alertSheet: HealthAlert? = null,
    val correction: CorrectionEditor? = null,
) {
    val status: RegisterStatus get() = register?.status ?: RegisterStatus.UNMARKED

    val isReadOnly: Boolean get() = !canEdit || status.isFinal || conflict != null

    /** Submit is offered only to markers who may finalise (never helpers). */
    val showSubmit: Boolean get() = canSubmit && !isHelper

    val entries: List<RosterEntryUi>
        get() = register?.entries.orEmpty().map { entry ->
            val mine = conflict?.takeIf { it.comparing }?.myMarks?.get(entry.studentId)
            val status = marks[entry.studentId]
            RosterEntryUi(
                studentId = entry.studentId,
                entryId = entry.entryId,
                name = entry.name,
                rollNo = entry.rollNo,
                photoUrl = entry.photoUrl,
                status = status,
                remark = entry.remark,
                onLeave = entry.onLeave,
                alert = alerts[entry.studentId],
                myStatus = mine,
                differs = conflict?.comparing == true && mine != status,
            )
        }

    val counts: RegisterCounts
        get() {
            val ids = register?.entries.orEmpty().map { it.studentId }
            val statuses = ids.map { marks[it] }
            return RegisterCounts(
                present = statuses.count { it == AttendanceStatus.PRESENT },
                absent = statuses.count { it == AttendanceStatus.ABSENT },
                late = statuses.count { it == AttendanceStatus.LATE },
                leave = statuses.count { it == AttendanceStatus.LEAVE },
                halfDay = statuses.count { it == AttendanceStatus.HALF_DAY },
                unmarked = statuses.count { it == null },
            )
        }
}
