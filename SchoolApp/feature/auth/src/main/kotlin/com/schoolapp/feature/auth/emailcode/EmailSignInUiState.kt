package com.schoolapp.feature.auth.emailcode

import androidx.compose.runtime.Immutable
import com.schoolapp.feature.auth.LoginFailure

/** Parent email-code sign-in: enter the email, then the emailed code. A 2FA step, if any, is the shared one. */
enum class EmailStep { EMAIL, CODE }

enum class EmailFieldError { REQUIRED, INVALID_EMAIL, INVALID_CODE }

@Immutable
data class EmailSignInUiState(
    val active: Boolean = false,
    val step: EmailStep = EmailStep.EMAIL,
    val email: String = "",
    val code: String = "",
    val emailError: EmailFieldError? = null,
    val codeError: EmailFieldError? = null,
    val isSubmitting: Boolean = false,
    val failure: LoginFailure? = null,
    /** Seconds until another code may be requested; 0 = resend allowed. */
    val resendInSeconds: Int = 0,
    /** Set when the account also needs 2FA; the login screen takes over and then clears it. */
    val pendingChallengeId: String? = null,
)
