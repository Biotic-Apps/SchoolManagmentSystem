package com.schoolapp.feature.auth

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.auth.DefaultAuthRepository

internal fun AppError.toLoginFailure(): LoginFailure = when (this) {
    AppError.Unauthorized, is AppError.Validation -> LoginFailure.INVALID_CREDENTIALS
    AppError.Network -> LoginFailure.NETWORK
    is AppError.Forbidden ->
        if (code == DefaultAuthRepository.NO_ROLE) LoginFailure.NO_ROLE else LoginFailure.ACCESS_DENIED
    is AppError.Server -> if (code in LOCKOUT_CODES) LoginFailure.LOCKED else LoginFailure.SERVER
    is AppError.Unknown -> LoginFailure.UNKNOWN
}

private val LOCKOUT_CODES = setOf("ACCOUNT_LOCKED", "RATE_LIMITED")
