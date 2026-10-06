package com.schoolapp.core.model.diary

sealed interface DiaryOutcome {
    data class Saved(val entry: DiaryEntry) : DiaryOutcome

    /** Probation or moderation: waiting for a reviewer. */
    data class PendingReview(val approvalId: String?) : DiaryOutcome

    /** Offline: queued in the outbox; a queued publish follows the queued save. */
    data object Queued : DiaryOutcome
}
