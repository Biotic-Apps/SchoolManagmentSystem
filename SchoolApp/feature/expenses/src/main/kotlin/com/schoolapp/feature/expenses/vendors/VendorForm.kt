package com.schoolapp.feature.expenses.vendors

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.expenses.VendorInput

enum class VendorField { NAME, CONTACT, PHONE, EMAIL, ADDRESS, NTN }

enum class VendorError { REQUIRED, TOO_SHORT, TOO_LONG, INVALID_PHONE, INVALID_EMAIL }

/** "Add vendor" sheet values; errors are keyed by field and shown inline. */
data class VendorFormState(
    val name: String = "",
    val contactPerson: String = "",
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val ntn: String = "",
    val errors: Map<VendorField, VendorError> = emptyMap(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(): Map<VendorField, VendorError> = buildMap {
        val trimmedName = name.trim()
        when {
            trimmedName.isEmpty() -> put(VendorField.NAME, VendorError.REQUIRED)
            trimmedName.length < MIN_NAME -> put(VendorField.NAME, VendorError.TOO_SHORT)
            trimmedName.length > MAX_NAME -> put(VendorField.NAME, VendorError.TOO_LONG)
        }
        if (contactPerson.trim().length > MAX_CONTACT) put(VendorField.CONTACT, VendorError.TOO_LONG)
        val trimmedPhone = phone.trim()
        if (trimmedPhone.isNotEmpty() && !PhonePattern.matches(trimmedPhone)) put(VendorField.PHONE, VendorError.INVALID_PHONE)
        val trimmedEmail = email.trim()
        if (trimmedEmail.isNotEmpty() && !EmailPattern.matches(trimmedEmail)) put(VendorField.EMAIL, VendorError.INVALID_EMAIL)
        if (address.trim().length > MAX_ADDRESS) put(VendorField.ADDRESS, VendorError.TOO_LONG)
        if (ntn.trim().length > MAX_NTN) put(VendorField.NTN, VendorError.TOO_LONG)
    }

    fun toInput() = VendorInput(
        name = name.trim(),
        contactPerson = contactPerson.blankToNull(),
        phone = phone.blankToNull(),
        email = email.blankToNull(),
        address = address.blankToNull(),
        ntn = ntn.blankToNull(),
    )

    companion object {
        const val MIN_NAME = 2
        const val MAX_NAME = 150
        const val MAX_CONTACT = 100
        const val MAX_ADDRESS = 300
        const val MAX_NTN = 30
        private val PhonePattern = Regex("""^\+?[0-9][0-9 \-]{6,29}$""")
        private val EmailPattern = Regex("""^[^@\s]+@[^@\s]+\.[^@\s]+$""")
    }
}

internal fun String.blankToNull(): String? = trim().takeIf { it.isNotEmpty() }
