package com.schoolapp.feature.auth.phone

/** Shape checks only; the server normalises the number to E.164 and decides whether the code is right. */
internal object PhoneSignInValidator {
    private val PhoneShape = Regex("^\\+?[0-9][0-9 ()-]*$")
    private val PhoneDigits = 10..15
    private const val CODE_LENGTH = 6

    /** Number as sent to the server: a leading `+` and digits only. */
    fun normalizePhone(value: String): String {
        val trimmed = value.trim()
        val digits = trimmed.filter(Char::isDigit)
        return if (trimmed.startsWith('+')) "+$digits" else digits
    }

    fun phone(value: String): PhoneFieldError? {
        val trimmed = value.trim()
        return when {
            trimmed.isEmpty() -> PhoneFieldError.REQUIRED
            !PhoneShape.matches(trimmed) -> PhoneFieldError.INVALID_PHONE
            trimmed.count(Char::isDigit) !in PhoneDigits -> PhoneFieldError.INVALID_PHONE
            else -> null
        }
    }

    fun normalizeCode(value: String): String = value.filterNot(Char::isWhitespace)

    fun code(value: String): PhoneFieldError? {
        val code = normalizeCode(value)
        return when {
            code.isEmpty() -> PhoneFieldError.REQUIRED
            code.length != CODE_LENGTH || !code.all(Char::isDigit) -> PhoneFieldError.INVALID_CODE
            else -> null
        }
    }
}
