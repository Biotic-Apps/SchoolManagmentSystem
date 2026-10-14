package com.schoolapp.core.network.guardians

import kotlinx.serialization.Serializable

/** `GET /guardians/:id`: the guardian, its parent login (null when none) and linked children. */
@Serializable
data class GuardianDetailDto(
    val id: String,
    val name: String,
    val relation: String? = null,
    val cnic: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val occupation: String? = null,
    val address: String? = null,
    val userId: String? = null,
    val hasAccount: Boolean = false,
    val login: GuardianLoginDto? = null,
    val children: List<GuardianChildDto> = emptyList(),
)

@Serializable
data class GuardianLoginDto(
    val email: String? = null,
    val phone: String? = null,
    val status: String? = null,
    val mustChangePassword: Boolean = false,
    val lastLoginAt: String? = null,
)

@Serializable
data class GuardianChildDto(
    val linkId: String? = null,
    val studentId: String,
    val admissionNo: String? = null,
    val name: String,
    val className: String? = null,
    val sectionName: String? = null,
    val relation: String? = null,
    val status: String? = null,
)

/** `POST /guardians/:id/account`. */
@Serializable
data class GuardianAccountDto(
    val userId: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val temporaryPassword: String? = null,
)

/** `POST /guardians/:id/account/reset-password`. */
@Serializable
data class GuardianPasswordResetDto(val userId: String? = null, val temporaryPassword: String? = null)

/** `POST /guardians/:id/account/send-sign-in`: EMAIL and/or SMS. */
@Serializable
data class GuardianSignInSentDto(val channels: List<String> = emptyList())

/** Body for `DELETE /students/:id/guardians/:linkId` and child-link decisions. */
@Serializable
data class ReasonBodyDto(val reason: String? = null)

/** `POST /guardians/login-slips/preview|print`: one section, or a branch (+ optional class). */
@Serializable
data class LoginSlipBodyDto(
    val sectionId: String? = null,
    val branchId: String? = null,
    val classId: String? = null,
)

@Serializable
data class LoginSlipPreviewDto(
    val students: Int = 0,
    val slips: Int = 0,
    val create: Int = 0,
    val reset: Int = 0,
    val keep: Int = 0,
    val skip: Int = 0,
    val loginUrl: String? = null,
)

@Serializable
data class LoginSlipJobDto(val jobId: String? = null, val count: Int? = null)
