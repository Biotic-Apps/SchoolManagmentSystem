package com.schoolapp.core.ui.unlock

/** Outcome of the system biometric / screen-lock prompt. */
sealed interface UnlockResult {
    data object Success : UnlockResult

    /** The person closed the prompt; nothing to report. */
    data object Cancelled : UnlockResult

    /** Lockout, hardware error and similar; [message] is the system's localised text. */
    data class Error(val message: String) : UnlockResult
}
