package com.schoolapp.feature.auth

/** Shape checks for the second sign-in step; the server decides whether the code is right. */
internal object TwoFactorValidator {
    private const val TOTP_LENGTH = 6
    private val RecoveryRegex = Regex("^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$")
    private val RecoveryLength = 8..20

    /** Code as it is sent to the server: spaces removed for TOTP, trimmed for recovery codes. */
    fun normalize(mode: TwoFactorMode, value: String): String = when (mode) {
        TwoFactorMode.AUTHENTICATOR -> value.filterNot(Char::isWhitespace)
        TwoFactorMode.RECOVERY -> value.trim()
    }

    fun validate(mode: TwoFactorMode, value: String): TwoFactorFieldError? {
        val code = normalize(mode, value)
        return when {
            code.isEmpty() -> TwoFactorFieldError.REQUIRED
            mode == TwoFactorMode.AUTHENTICATOR ->
                TwoFactorFieldError.INVALID_TOTP.takeUnless { code.length == TOTP_LENGTH && code.all(Char::isDigit) }
            else -> TwoFactorFieldError.INVALID_RECOVERY
                .takeUnless { code.length in RecoveryLength && RecoveryRegex.matches(code) }
        }
    }
}
