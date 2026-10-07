package com.schoolapp.feature.auth

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.auth.DefaultAuthRepository
import com.schoolapp.core.data.auth.code

internal fun AppError.toLoginFailure(): LoginFailure = when (this) {
    AppError.Unauthorized, is AppError.Validation -> LoginFailure.INVALID_CREDENTIALS
    AppError.Network -> LoginFailure.NETWORK
    is AppError.Forbidden ->
        if (code == DefaultAuthRepository.NO_ROLE) LoginFailure.NO_ROLE else LoginFailure.ACCESS_DENIED
    is AppError.Server -> if (code in LOCKOUT_CODES) LoginFailure.LOCKED else LoginFailure.SERVER
    is AppError.Unknown -> LoginFailure.UNKNOWN
}

/** `POST /auth/2fa/verify` errors; an expired challenge sends the user back to the password step. */
internal fun AppError.toTwoFactorFailure(): LoginFailure = when {
    code == CHALLENGE_EXPIRED || (this is AppError.Server && httpCode == HTTP_GONE) -> LoginFailure.CHALLENGE_EXPIRED
    code in LOCKOUT_CODES || (this is AppError.Server && httpCode == HTTP_TOO_MANY) -> LoginFailure.LOCKED
    this == AppError.Unauthorized || this is AppError.Validation -> LoginFailure.INVALID_CODE
    this is AppError.Server && httpCode == HTTP_BAD_REQUEST -> LoginFailure.INVALID_CODE
    else -> toLoginFailure()
}

private val LOCKOUT_CODES = setOf("ACCOUNT_LOCKED", "RATE_LIMITED")
private const val CHALLENGE_EXPIRED = "CHALLENGE_EXPIRED"
private const val HTTP_BAD_REQUEST = 400
private const val HTTP_GONE = 410
private const val HTTP_TOO_MANY = 429

/** `POST /auth/otp/verify` errors: a wrong, expired or used code is 401 "Invalid or expired code". */
internal fun AppError.toOtpFailure(): LoginFailure = when (this) {
    AppError.Unauthorized, is AppError.Validation -> LoginFailure.OTP_INVALID
    else -> toLoginFailure()
}
