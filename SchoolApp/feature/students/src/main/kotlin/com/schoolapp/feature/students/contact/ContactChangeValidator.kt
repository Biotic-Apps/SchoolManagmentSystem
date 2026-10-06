package com.schoolapp.feature.students.contact

enum class ContactFieldError { EMPTY, PHONE_INVALID, EMAIL_INVALID }

/** Client-side checks only; the server validates again. Returns null when the form can be sent. */
internal object ContactChangeValidator {
    private val PhonePattern = Regex("^\\+?[0-9][0-9 -]{8,16}$")
    private val EmailPattern = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

    fun validate(phone: String, email: String, address: String): ContactFieldError? = when {
        phone.isBlank() && email.isBlank() && address.isBlank() -> ContactFieldError.EMPTY
        phone.isNotBlank() && !PhonePattern.matches(phone.trim()) -> ContactFieldError.PHONE_INVALID
        email.isNotBlank() && !EmailPattern.matches(email.trim()) -> ContactFieldError.EMAIL_INVALID
        else -> null
    }
}
