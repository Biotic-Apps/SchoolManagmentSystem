package com.schoolapp.feature.auth.emailcode

/** Shape checks only; the server matches the address case-insensitively and decides whether the code is right. */
internal object EmailSignInValidator {
    private val EmailShape = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
    private const val MAX_EMAIL_LENGTH = 254
    private const val CODE_LENGTH = 6

    /** Address as sent to the server: trimmed and lower-cased. */
    fun normalizeEmail(value: String): String = value.trim().lowercase()

    fun email(value: String): EmailFieldError? {
        val trimmed = value.trim()
        return when {
            trimmed.isEmpty() -> EmailFieldError.REQUIRED
            trimmed.length > MAX_EMAIL_LENGTH || !EmailShape.matches(trimmed) -> EmailFieldError.INVALID_EMAIL
            else -> null
        }
    }

    fun normalizeCode(value: String): String = value.filterNot(Char::isWhitespace)

    fun code(value: String): EmailFieldError? {
        val code = normalizeCode(value)
        return when {
            code.isEmpty() -> EmailFieldError.REQUIRED
            code.length != CODE_LENGTH || !code.all(Char::isDigit) -> EmailFieldError.INVALID_CODE
            else -> null
        }
    }
}
