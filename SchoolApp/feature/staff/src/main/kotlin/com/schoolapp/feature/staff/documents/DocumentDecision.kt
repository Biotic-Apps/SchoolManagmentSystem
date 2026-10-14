package com.schoolapp.feature.staff.documents

import com.schoolapp.core.common.result.AppError

internal enum class DecisionKind { VERIFY, REJECT }

/** Verify (optional note, max 500) or reject (reason 3..500) dialog for one document. */
internal data class DocumentDecision(
    val documentId: String,
    val kind: DecisionKind,
    val text: String = "",
    val showErrors: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val isTextValid: Boolean
        get() {
            val length = text.trim().length
            return when (kind) {
                DecisionKind.VERIFY -> length <= MAX
                DecisionKind.REJECT -> length in REASON_MIN..MAX
            }
        }

    companion object {
        const val REASON_MIN = 3
        const val MAX = 500
    }
}
