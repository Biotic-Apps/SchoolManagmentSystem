package com.schoolapp.core.model.exams

sealed interface MarkSheetOutcome {
    data class Saved(val sheet: MarkSheet) : MarkSheetOutcome

    /** Probation: held for the reviewer. */
    data class PendingReview(val approvalId: String?) : MarkSheetOutcome

    /** Offline: kept in the outbox with its clientRequestId and sent later. */
    data object Queued : MarkSheetOutcome
}

/** Outbox state of one mark sheet on this device. */
enum class MarkSheetSyncState { NONE, QUEUED, NEEDS_ATTENTION }
