package com.schoolapp.core.model.people

/** What is wrong with one form field; screens turn it into text. */
enum class PersonProblem { REQUIRED, TOO_LONG, TOO_SHORT, BAD_DATE, FUTURE_DATE, BAD_ID_NUMBER, BAD_PHONE, BAD_EMAIL, DUPLICATE_PHONE }

/** Same limits as the API DTOs (child/guardian input) and the web's zod schemas. */
object PersonRules {
    const val NAME_MAX = 60
    const val GUARDIAN_NAME_MAX = 100
    const val REASON_MIN = 3
    const val REASON_MAX = 500
    const val ADDRESS_MAX = 255

    private val idNumber = Regex("""^\d{5}-?\d{7}-?\d$""")
    private val phone = Regex("""^\+?[0-9\s-]{7,20}$""")
    private val email = Regex("""^[^\s@]+@[^\s@]+\.[^\s@]+$""")
    private val isoDate = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun requiredName(value: String, max: Int = NAME_MAX, min: Int = 1): PersonProblem? = when {
        value.isBlank() -> PersonProblem.REQUIRED
        value.trim().length < min -> PersonProblem.TOO_SHORT
        value.trim().length > max -> PersonProblem.TOO_LONG
        else -> null
    }

    fun optionalText(value: String, max: Int): PersonProblem? = if (value.trim().length > max) PersonProblem.TOO_LONG else null

    /** `YYYY-MM-DD`; [today] (same format) rejects future dates when given. */
    fun date(value: String, today: String? = null): PersonProblem? = when {
        value.isBlank() -> PersonProblem.REQUIRED
        !isoDate.matches(value) -> PersonProblem.BAD_DATE
        today != null && value > today -> PersonProblem.FUTURE_DATE
        else -> null
    }

    /** B-Form / CNIC: optional, 13 digits with optional dashes. */
    fun idNumber(value: String): PersonProblem? =
        if (value.isNotBlank() && !idNumber.matches(value.trim())) PersonProblem.BAD_ID_NUMBER else null

    fun phone(value: String): PersonProblem? = when {
        value.isBlank() -> PersonProblem.REQUIRED
        !phone.matches(value.trim()) -> PersonProblem.BAD_PHONE
        else -> null
    }

    fun email(value: String): PersonProblem? = if (value.isNotBlank() && !email.matches(value.trim())) PersonProblem.BAD_EMAIL else null

    fun reason(value: String): PersonProblem? = when {
        value.isBlank() -> PersonProblem.REQUIRED
        value.trim().length < REASON_MIN -> PersonProblem.TOO_SHORT
        value.trim().length > REASON_MAX -> PersonProblem.TOO_LONG
        else -> null
    }

    /** Digits only, so "0300-1234567" and "03001234567" count as the same number. */
    fun samePhone(a: String, b: String): Boolean = a.filter(Char::isDigit).takeLast(10) == b.filter(Char::isDigit).takeLast(10)
}
