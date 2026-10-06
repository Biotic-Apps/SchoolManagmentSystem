package com.schoolapp.feature.auth.forgot

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.auth.LoginFieldError

/** [sent] shows the neutral "if an account exists" message; it never reveals whether the account exists. */
@Immutable
data class ForgotPasswordUiState(
    val identifier: String = "",
    val identifierError: LoginFieldError? = null,
    val isSubmitting: Boolean = false,
    val sent: Boolean = false,
    val failure: AppError? = null,
)
