package com.schoolapp.feature.admin.schools.edit

import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.admin.common.AdminFormRules
import com.schoolapp.feature.admin.common.FieldProblem

/** Web `schools/schemas.ts` + API CreateSchoolDto limits. */
internal object SchoolFormValidation {
    private const val ADDRESS_MAX = 300
    private const val WEBSITE_MAX = 200

    fun validate(form: SchoolForm): Map<SchoolField, FieldProblem> = buildMap {
        AdminFormRules.name(form.name)?.let { put(SchoolField.NAME, it) }
        AdminFormRules.phone(form.phone)?.let { put(SchoolField.PHONE, it) }
        AdminFormRules.email(form.email)?.let { put(SchoolField.EMAIL, it) }
        (AdminFormRules.url(form.website) ?: tooLong(form.website, WEBSITE_MAX))?.let { put(SchoolField.WEBSITE, it) }
        tooLong(form.address, ADDRESS_MAX)?.let { put(SchoolField.ADDRESS, it) }
    }

    private fun tooLong(value: String, max: Int) = if (value.trim().length > max) FieldProblem.TOO_LONG else null

    /** class-validator lines start with the field path ("email must be an email"). */
    fun serverFields(error: AppError): Map<SchoolField, String> {
        val fields = (error as? AppError.Validation)?.fields ?: return emptyMap()
        return fields.mapNotNull { (key, message) ->
            val field = SchoolField.entries.firstOrNull { it.name.equals(key, ignoreCase = true) } ?: return@mapNotNull null
            field to message.replaceFirstChar(Char::uppercase)
        }.toMap()
    }
}
