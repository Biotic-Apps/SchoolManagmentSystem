package com.schoolapp.feature.admin.common

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/** Field problems shared by the school, setup and user forms; each maps to one string in [fieldProblemText]. */
enum class FieldProblem {
    REQUIRED,
    TOO_SHORT,
    TOO_LONG,
    INVALID_CODE,
    INVALID_EMAIL,
    INVALID_PHONE,
    INVALID_URL,
    CONTACT_REQUIRED,
    WEAK_PASSWORD,
}

/** Same rules as the web (`lib/validation.ts`) and the API DTOs, so most mistakes never reach the server. */
object AdminFormRules {
    private val CODE = Regex("^[A-Z0-9]{2,12}$")
    private val EMAIL = Regex("""^[^\s@]+@[^\s@]+\.[^\s@]+$""")
    private val PHONE = Regex("""^\+?[0-9\s-]{7,20}$""")
    private val URL = Regex("""^https?://\S+\.\S+""")
    private const val EMAIL_MAX = 254
    private const val PASSWORD_MIN = 8

    /** 2–12 uppercase letters or digits (the field upper-cases as you type). */
    fun code(value: String): FieldProblem? = when {
        value.isBlank() -> FieldProblem.REQUIRED
        CODE.matches(value.trim()) -> null
        else -> FieldProblem.INVALID_CODE
    }

    /** Required name of [min]..[max] characters. */
    fun name(value: String, min: Int = 2, max: Int = 120): FieldProblem? {
        val text = value.trim()
        return when {
            text.isEmpty() -> FieldProblem.REQUIRED
            text.length < min -> FieldProblem.TOO_SHORT
            text.length > max -> FieldProblem.TOO_LONG
            else -> null
        }
    }

    fun email(value: String): FieldProblem? {
        val text = value.trim()
        return if (text.isNotEmpty() && (text.length > EMAIL_MAX || !EMAIL.matches(text))) FieldProblem.INVALID_EMAIL else null
    }

    fun phone(value: String): FieldProblem? {
        val text = value.trim()
        return if (text.isNotEmpty() && !PHONE.matches(text)) FieldProblem.INVALID_PHONE else null
    }

    fun url(value: String): FieldProblem? {
        val text = value.trim()
        return if (text.isNotEmpty() && !URL.containsMatchIn(text)) FieldProblem.INVALID_URL else null
    }

    /** At least 8 characters with a letter and a digit; empty is allowed only when [optional]. */
    fun password(value: String, optional: Boolean): FieldProblem? = when {
        value.isEmpty() -> if (optional) null else FieldProblem.REQUIRED
        value.length < PASSWORD_MIN || value.none(Char::isLetter) || value.none(Char::isDigit) -> FieldProblem.WEAK_PASSWORD
        else -> null
    }

    /** Sign-in needs an email or a phone. */
    fun hasContact(email: String, phone: String): Boolean = email.isNotBlank() || phone.isNotBlank()

    /** Upper-cases and drops anything but letters and digits, capped at 12 (code fields). */
    fun cleanCode(value: String): String = value.uppercase().filter { it in 'A'..'Z' || it in '0'..'9' }.take(12)
}

/** Forms stay full width on phones and become a centred pane on tablets and large windows. */
val AdminFormMaxWidth: Dp = 640.dp
