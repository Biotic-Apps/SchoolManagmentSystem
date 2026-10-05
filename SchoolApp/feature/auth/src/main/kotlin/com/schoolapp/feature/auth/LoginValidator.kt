package com.schoolapp.feature.auth

/** Client-side checks only; credentials are verified by the server. */
internal object LoginValidator {
    private val EmailRegex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    private const val MIN_IDENTIFIER_LENGTH = 3

    fun identifier(value: String): LoginFieldError? {
        val trimmed = value.trim()
        return when {
            trimmed.isEmpty() -> LoginFieldError.REQUIRED
            '@' in trimmed && !EmailRegex.matches(trimmed) -> LoginFieldError.INVALID_EMAIL
            trimmed.length < MIN_IDENTIFIER_LENGTH -> LoginFieldError.TOO_SHORT
            else -> null
        }
    }

    fun password(value: String): LoginFieldError? =
        if (value.isEmpty()) LoginFieldError.REQUIRED else null
}
