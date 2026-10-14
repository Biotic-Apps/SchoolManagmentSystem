package com.schoolapp.feature.profile.twofactor

import com.schoolapp.core.common.result.AppError

/** Client-side checks matching the API DTOs, and mapping of "wrong code" failures. */
internal object TwoFactorCodeRules {
    private val TOTP = Regex("^[0-9]{6}$")
    private val ANY_CODE = Regex("^[A-Za-z0-9-]{6,20}$")
    private const val MAX_ANY = 20

    fun normalize(code: String): String = code.filterNot(Char::isWhitespace)

    /** Authenticator code only (enable, regenerate). */
    fun totp(code: String): CodeFieldError? {
        val value = normalize(code)
        return when {
            value.isEmpty() -> CodeFieldError.REQUIRED_TOTP
            !TOTP.matches(value) -> CodeFieldError.REQUIRED_TOTP
            else -> null
        }
    }

    /** Authenticator code or recovery code (disable). */
    fun any(code: String): CodeFieldError? {
        val value = normalize(code)
        return when {
            value.isEmpty() -> CodeFieldError.REQUIRED_ANY
            value.length > MAX_ANY -> CodeFieldError.TOO_LONG
            !ANY_CODE.matches(value) -> CodeFieldError.INVALID
            else -> null
        }
    }

    /** INVALID_CREDENTIALS arrives as 401 ([AppError.Unauthorized]); a DTO rejection as Validation. */
    fun isWrongCode(error: AppError): Boolean = error == AppError.Unauthorized || error is AppError.Validation
}
