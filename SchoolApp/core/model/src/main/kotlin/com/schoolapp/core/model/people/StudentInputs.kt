package com.schoolapp.core.model.people

/** The child part of a registration or admission application (phase2-contract §1). Optional fields: null = not given. */
data class ChildInput(
    val firstName: String,
    val lastName: String,
    val dob: String,
    val gender: String,
    val bForm: String? = null,
    val previousSchool: String? = null,
    val address: String? = null,
)

/** A guardian's details; [relation] is a [GuardianRelation] name. */
data class GuardianInput(
    val name: String,
    val relation: String,
    val phone: String,
    val cnic: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
)

/** A guardian row of a registration/application; exactly one row is primary. */
data class GuardianEntry(val guardian: GuardianInput, val isPrimary: Boolean)

/** `POST /students`: direct registration into a section (bypassing admissions). */
data class RegisterStudentInput(
    val child: ChildInput,
    val guardians: List<GuardianEntry>,
    val sectionId: String,
    val admissionDate: String,
)

/** `POST /admissions/applications`. */
data class ApplicationInput(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val child: ChildInput,
    val guardians: List<GuardianEntry>,
    val notes: String? = null,
)

/** `PATCH /students/:id`; a null [bForm] keeps the stored (masked) one. */
data class StudentUpdate(
    val firstName: String,
    val lastName: String,
    val dob: String,
    val gender: String,
    val bForm: String?,
    val address: String,
)

/** A student placement change: withdraw, move to another section, or transfer to another branch. */
sealed interface EnrollmentChange {
    val effectiveDate: String
    val reason: String

    data class Withdraw(override val effectiveDate: String, override val reason: String) : EnrollmentChange
    data class ChangeSection(val sectionId: String, override val effectiveDate: String, override val reason: String) : EnrollmentChange
    data class Transfer(val toBranchId: String, override val effectiveDate: String, override val reason: String) : EnrollmentChange
}

/** `POST /students/:id/guardians`: link an existing guardian ([guardianId]) or create a new one ([guardian]). */
data class LinkGuardianInput(
    val relation: String,
    val isPrimary: Boolean,
    val guardianId: String? = null,
    val guardian: GuardianInput? = null,
)

/** Result of a registration: the new student's id, name and admission number. */
data class RegisteredStudent(val id: String, val name: String, val admissionNo: String?)
