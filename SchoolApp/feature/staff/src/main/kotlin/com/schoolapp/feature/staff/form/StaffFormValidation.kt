package com.schoolapp.feature.staff.form

/** Mirrors the web schema and the API DTO (`staff-input.dto.ts`) so most mistakes never reach the server. */
object StaffFormValidation {
    private val EMAIL = Regex("""^[^\s@]+@[^\s@]+\.[^\s@]+$""")
    private val PHONE = Regex("""^\+?[0-9][0-9\s()-]{6,19}$""")
    private val CNIC = Regex("""^\d{5}-?\d{7}-?\d$""")
    private const val NAME_MIN = 2
    private const val NAME_MAX = 100
    private const val EMAIL_MAX = 254
    private const val EMPLOYEE_NO_MAX = 30
    private const val QUALIFICATION_MAX = 200

    /** [requireContact]: a sign-in account needs an email or a phone. */
    fun validate(form: StaffForm, requireContact: Boolean): Map<StaffField, FieldProblem> = buildMap {
        val name = form.name.trim()
        when {
            name.isEmpty() -> put(StaffField.NAME, FieldProblem.REQUIRED)
            name.length < NAME_MIN -> put(StaffField.NAME, FieldProblem.TOO_SHORT)
            name.length > NAME_MAX -> put(StaffField.NAME, FieldProblem.TOO_LONG)
        }
        putAll(validateContact(form.email, form.phone, requireContact))
        if (form.employeeNo.trim().length > EMPLOYEE_NO_MAX) put(StaffField.EMPLOYEE_NO, FieldProblem.TOO_LONG)
        if (form.designation.isNullOrEmpty()) put(StaffField.DESIGNATION, FieldProblem.REQUIRED)
        if (form.joinDate.isNullOrEmpty()) put(StaffField.JOIN_DATE, FieldProblem.REQUIRED)
        val cnic = form.cnic.trim()
        if (cnic.isNotEmpty() && !CNIC.matches(cnic)) put(StaffField.CNIC, FieldProblem.INVALID_CNIC)
        if (form.qualification.trim().length > QUALIFICATION_MAX) put(StaffField.QUALIFICATION, FieldProblem.TOO_LONG)
    }

    /** Email / phone format, and [required]: at least one of them (needed to sign in). */
    fun validateContact(email: String, phone: String, required: Boolean): Map<StaffField, FieldProblem> = buildMap {
        val e = email.trim()
        val p = phone.trim()
        if (e.isNotEmpty() && (e.length > EMAIL_MAX || !EMAIL.matches(e))) put(StaffField.EMAIL, FieldProblem.INVALID_EMAIL)
        if (p.isNotEmpty() && !PHONE.matches(p)) put(StaffField.PHONE, FieldProblem.INVALID_PHONE)
        if (required && e.isEmpty() && p.isEmpty()) put(StaffField.EMAIL, FieldProblem.CONTACT_FOR_ACCOUNT)
    }
}
