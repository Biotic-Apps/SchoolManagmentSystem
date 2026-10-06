package com.schoolapp.core.model.syllabus

sealed interface ProgressOutcome {
    data object Applied : ProgressOutcome

    /** Probation: held until the reviewer approves it. */
    data class PendingReview(val approvalId: String?) : ProgressOutcome

    /** Offline: stored in the outbox and sent once the device is online. */
    data object Queued : ProgressOutcome
}
