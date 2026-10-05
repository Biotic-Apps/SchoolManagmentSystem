package com.schoolapp.feature.profile.password

/** Contract password rules: at least 8 characters with a letter and a digit. */
internal object PasswordRules {
    private const val MIN_LENGTH = 8

    fun current(value: String): PasswordFieldError? = if (value.isEmpty()) PasswordFieldError.REQUIRED else null

    fun new(value: String, current: String): PasswordFieldError? = when {
        value.isEmpty() -> PasswordFieldError.REQUIRED
        value.length < MIN_LENGTH -> PasswordFieldError.TOO_SHORT
        value.none(Char::isLetter) || value.none(Char::isDigit) -> PasswordFieldError.NEEDS_LETTER_AND_DIGIT
        value == current -> PasswordFieldError.SAME_AS_CURRENT
        else -> null
    }

    fun confirm(value: String, new: String): PasswordFieldError? = when {
        value.isEmpty() -> PasswordFieldError.REQUIRED
        value != new -> PasswordFieldError.MISMATCH
        else -> null
    }
}
