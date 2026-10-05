package com.schoolapp.feature.profile

/** Client-side checks; uniqueness of email/phone is enforced by the server (`CONFLICT`). */
internal object ProfileValidator {
    private val EmailRegex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    private val PhoneRegex = Regex("^\\+?[0-9 ()-]+$")
    private const val MIN_NAME = 2
    private const val MIN_PHONE_DIGITS = 7
    private const val MAX_PHONE_DIGITS = 15

    data class Result(
        val name: ProfileFieldError?,
        val email: ProfileFieldError?,
        val phone: ProfileFieldError?,
    ) {
        val isValid: Boolean get() = name == null && email == null && phone == null
    }

    fun validate(fields: ProfileFields): Result {
        val f = fields.trimmed()
        val name = when {
            f.name.isEmpty() -> ProfileFieldError.REQUIRED
            f.name.length < MIN_NAME -> ProfileFieldError.TOO_SHORT
            else -> null
        }
        val email = when {
            f.email.isEmpty() && f.phone.isEmpty() -> ProfileFieldError.CONTACT_REQUIRED
            f.email.isNotEmpty() && !EmailRegex.matches(f.email) -> ProfileFieldError.INVALID_EMAIL
            else -> null
        }
        val digits = f.phone.count(Char::isDigit)
        val phone = when {
            f.phone.isEmpty() -> null
            !PhoneRegex.matches(f.phone) || digits !in MIN_PHONE_DIGITS..MAX_PHONE_DIGITS -> ProfileFieldError.INVALID_PHONE
            else -> null
        }
        return Result(name, email, phone)
    }
}
