package com.schoolapp.feature.staff.form

import com.schoolapp.core.common.result.AppError

/**
 * Pins the API's 409 conflicts (`staff.service.ts`, `account-provisioner.ts`) on the field that caused them.
 * Anything else stays a form-level banner.
 */
object StaffServerErrors {
    fun fieldsFor(error: AppError): Map<StaffField, FieldProblem> {
        val message = (error as? AppError.Server)?.takeIf { it.httpCode == CONFLICT }?.message?.lowercase() ?: return emptyMap()
        return when {
            "employee number" in message -> mapOf(StaffField.EMPLOYEE_NO to FieldProblem.EMPLOYEE_NO_TAKEN)
            "already has a staff record" in message -> mapOf(StaffField.EMAIL to FieldProblem.EMAIL_TAKEN, StaffField.PHONE to FieldProblem.EMAIL_TAKEN)
            "different accounts" in message -> mapOf(StaffField.EMAIL to FieldProblem.CONTACT_MISMATCH, StaffField.PHONE to FieldProblem.CONTACT_MISMATCH)
            else -> emptyMap()
        }
    }

    private const val CONFLICT = 409
}
