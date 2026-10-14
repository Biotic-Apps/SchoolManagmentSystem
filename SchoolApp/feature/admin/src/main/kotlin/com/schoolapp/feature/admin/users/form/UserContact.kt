package com.schoolapp.feature.admin.users.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.admin.common.AdminFormRules
import com.schoolapp.feature.admin.common.FieldProblem

enum class UserField { NAME, EMAIL, PHONE, PASSWORD }

@Immutable
data class UserContact(val name: String = "", val email: String = "", val phone: String = "")

/** Web users/schemas.ts + API CreateUserDto (name 2–100, email or phone required). */
internal object UserFormValidation {
    private const val NAME_MAX = 100

    fun contact(contact: UserContact): Map<UserField, FieldProblem> = buildMap {
        AdminFormRules.name(contact.name, max = NAME_MAX)?.let { put(UserField.NAME, it) }
        AdminFormRules.email(contact.email)?.let { put(UserField.EMAIL, it) }
        AdminFormRules.phone(contact.phone)?.let { put(UserField.PHONE, it) }
        if (!containsKey(UserField.EMAIL) && !AdminFormRules.hasContact(contact.email, contact.phone)) {
            put(UserField.EMAIL, FieldProblem.CONTACT_REQUIRED)
        }
    }

    fun password(password: String): Map<UserField, FieldProblem> =
        AdminFormRules.password(password, optional = true)?.let { mapOf(UserField.PASSWORD to it) }.orEmpty()

    /** 409 "email / phone already in use" pinned on the field; validation lines by their first word. */
    fun serverFields(error: AppError): Map<UserField, String> = when (error) {
        is AppError.Server -> {
            val message = error.message.orEmpty()
            val lower = message.lowercase()
            when {
                error.httpCode != CONFLICT -> emptyMap()
                "email" in lower -> mapOf(UserField.EMAIL to message)
                "phone" in lower -> mapOf(UserField.PHONE to message)
                else -> emptyMap()
            }
        }
        is AppError.Validation -> error.fields.mapNotNull { (key, message) ->
            UserField.entries.firstOrNull { it.name.equals(key, ignoreCase = true) }?.let { it to message.replaceFirstChar(Char::uppercase) }
        }.toMap()
        else -> emptyMap()
    }

    private const val CONFLICT = 409
}
