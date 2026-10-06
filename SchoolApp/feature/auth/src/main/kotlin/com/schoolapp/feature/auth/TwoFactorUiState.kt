package com.schoolapp.feature.auth

import androidx.compose.runtime.Immutable

enum class TwoFactorMode { AUTHENTICATOR, RECOVERY }

enum class TwoFactorFieldError { REQUIRED, INVALID_TOTP, INVALID_RECOVERY }

@Immutable
data class TwoFactorUiState(
    val mode: TwoFactorMode = TwoFactorMode.AUTHENTICATOR,
    val code: String = "",
    val codeError: TwoFactorFieldError? = null,
)
