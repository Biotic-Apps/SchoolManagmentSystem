package com.schoolapp.feature.auth.reset

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError

enum class ResetFieldError { REQUIRED, TOO_SHORT, NEEDS_LETTER_AND_DIGIT, MISMATCH }

sealed interface ResetFailure {
    /** Server rejected the reset code (wrong, used or older than 30 minutes). */
    data object InvalidCode : ResetFailure

    data class Error(val error: AppError) : ResetFailure
}

@Immutable
data class ResetPasswordUiState(
    val token: String = "",
    val newPassword: String = "",
    val confirm: String = "",
    val tokenError: ResetFieldError? = null,
    val newError: ResetFieldError? = null,
    val confirmError: ResetFieldError? = null,
    val isSubmitting: Boolean = false,
    val failure: ResetFailure? = null,
    val done: Boolean = false,
)
