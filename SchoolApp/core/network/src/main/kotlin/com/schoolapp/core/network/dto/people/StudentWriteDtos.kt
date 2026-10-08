package com.schoolapp.core.network.dto.people

import kotlinx.serialization.Serializable

/** Child part of `POST /students` and `POST /admissions/applications`; nulls are left out of the body. */
@Serializable
data class ChildRequest(
    val firstName: String,
    val lastName: String,
    val dob: String,
    val gender: String,
    val bForm: String? = null,
    val previousSchool: String? = null,
    val address: String? = null,
)

@Serializable
data class GuardianRequest(
    val name: String,
    val relation: String,
    val phone: String,
    val cnic: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
    /** Only inside a registration/application. */
    val isPrimary: Boolean? = null,
)

@Serializable
data class RegisterStudentRequest(
    val child: ChildRequest,
    val guardians: List<GuardianRequest>,
    val sectionId: String,
    val admissionDate: String,
)

@Serializable
data class ApplicationRequest(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val child: ChildRequest,
    val guardians: List<GuardianRequest>,
    val notes: String? = null,
)

/** `PATCH /students/:id`; a missing bForm keeps the stored one. */
@Serializable
data class UpdateStudentRequest(
    val firstName: String,
    val lastName: String,
    val dob: String,
    val gender: String,
    val bForm: String? = null,
    val address: String,
)

@Serializable
data class WithdrawRequest(val effectiveDate: String, val reason: String)

@Serializable
data class ChangeSectionRequest(val sectionId: String, val effectiveDate: String, val reason: String)

@Serializable
data class TransferRequest(val toBranchId: String, val effectiveDate: String, val reason: String)

/** `POST /students/:id/guardians`: either [guardianId] or [guardian]. */
@Serializable
data class LinkGuardianRequest(
    val relation: String,
    val isPrimary: Boolean,
    val guardianId: String? = null,
    val guardian: GuardianRequest? = null,
)

/** `PATCH /guardians/:id`. */
@Serializable
data class UpdateGuardianRequest(
    val name: String,
    val relation: String,
    val phone: String,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
)
