package com.schoolapp.feature.auth

import androidx.compose.runtime.Immutable

enum class LoginFieldError { REQUIRED, INVALID_EMAIL, TOO_SHORT }

enum class LoginFailure {
    INVALID_CREDENTIALS,
    NETWORK,
    NO_ROLE,
    ACCESS_DENIED,
    LOCKED,
    SERVER,
    UNKNOWN,
    INVALID_CODE,
    CHALLENGE_EXPIRED,
    OTP_INVALID,
}

enum class LoginStep { PASSWORD, TWO_FACTOR }

@Immutable
data class LoginUiState(
    val identifier: String = "",
    val password: String = "",
    val identifierError: LoginFieldError? = null,
    val passwordError: LoginFieldError? = null,
    val isSubmitting: Boolean = false,
    val failure: LoginFailure? = null,
    val step: LoginStep = LoginStep.PASSWORD,
    val twoFactor: TwoFactorUiState = TwoFactorUiState(),
)
