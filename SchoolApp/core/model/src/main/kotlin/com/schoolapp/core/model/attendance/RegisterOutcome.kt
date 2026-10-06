package com.schoolapp.core.model.attendance

sealed interface RegisterOutcome {
    /** Applied by the server; [register] is the canonical copy. */
    data class Saved(val register: AttendanceRegister) : RegisterOutcome

    /** Probation: held for review. */
    data class PendingReview(val approvalId: String?) : RegisterOutcome

    /** Offline: kept on the device and queued with its clientRequestId. */
    data object Queued : RegisterOutcome

    /** `409 ALREADY_SUBMITTED`: someone else submitted first; [current] is the server register. */
    data class AlreadySubmitted(val current: AttendanceRegister?) : RegisterOutcome

    /** `423 RECORD_LOCKED`: past the lock time, only corrections are possible. */
    data object Locked : RegisterOutcome
}
