package com.schoolapp.feature.auth.phone

import androidx.compose.runtime.Immutable
import com.schoolapp.feature.auth.LoginFailure

/** Parent phone sign-in: enter the number, then the texted code. A 2FA step, if any, is the shared one. */
enum class PhoneStep { PHONE, CODE }

enum class PhoneFieldError { REQUIRED, INVALID_PHONE, INVALID_CODE }

@Immutable
data class PhoneSignInUiState(
    val active: Boolean = false,
    val step: PhoneStep = PhoneStep.PHONE,
    val phone: String = "",
    val code: String = "",
    val phoneError: PhoneFieldError? = null,
    val codeError: PhoneFieldError? = null,
    val isSubmitting: Boolean = false,
    val failure: LoginFailure? = null,
    /** Seconds until another code may be requested; 0 = resend allowed. */
    val resendInSeconds: Int = 0,
    /** Set when the account also needs 2FA; the login screen takes over and then clears it. */
    val pendingChallengeId: String? = null,
)
