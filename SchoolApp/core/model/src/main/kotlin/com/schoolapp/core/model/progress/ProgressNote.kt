package com.schoolapp.core.model.progress

import com.schoolapp.core.model.common.PersonRef

enum class ProgressCategory { HOMEWORK, BEHAVIOUR, LEARNING, ACHIEVEMENT }

data class ProgressNote(
    val id: String,
    val studentId: String,
    val category: ProgressCategory,
    val note: String,
    val visibleToParent: Boolean,
    val author: PersonRef?,
    val createdAt: String?,
)

data class ProgressNoteInput(val category: ProgressCategory, val note: String, val visibleToParent: Boolean)

/** `POST /students/:id/progress-notes` result: saved, or held for a probation review. */
sealed interface ProgressNoteOutcome {
    data class Saved(val note: ProgressNote) : ProgressNoteOutcome
    data class PendingReview(val approvalId: String?) : ProgressNoteOutcome
}
