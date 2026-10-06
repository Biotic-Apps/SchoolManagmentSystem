package com.schoolapp.feature.auth.reset

/** Same rule as Change password (contract): at least 8 characters with a letter and a digit. */
internal object ResetPasswordRules {
    private const val MIN_LENGTH = 8

    fun token(value: String): ResetFieldError? = if (value.isBlank()) ResetFieldError.REQUIRED else null

    fun new(value: String): ResetFieldError? = when {
        value.isEmpty() -> ResetFieldError.REQUIRED
        value.length < MIN_LENGTH -> ResetFieldError.TOO_SHORT
        value.none(Char::isLetter) || value.none(Char::isDigit) -> ResetFieldError.NEEDS_LETTER_AND_DIGIT
        else -> null
    }

    fun confirm(value: String, new: String): ResetFieldError? = when {
        value.isEmpty() -> ResetFieldError.REQUIRED
        value != new -> ResetFieldError.MISMATCH
        else -> null
    }
}
