package com.schoolapp.core.model.guardians

import com.schoolapp.core.model.people.Guardian

/** `GET /guardians/:id`: the record, its parent sign-in ([login] null when none) and linked children. */
data class GuardianDetail(
    val guardian: Guardian,
    /** Masked by the server. */
    val cnic: String?,
    val login: GuardianLogin?,
    val children: List<GuardianChild>,
)

/** The parent login behind a guardian; its email/phone may differ from the record's. */
data class GuardianLogin(
    val email: String?,
    val phone: String?,
    /** ACTIVE or DISABLED. */
    val status: String?,
    /** Still on a temporary password (never signed in). */
    val mustChangePassword: Boolean,
    val lastLoginAt: String?,
) {
    val isActive: Boolean get() = status == null || status == "ACTIVE"
}

data class GuardianChild(
    val linkId: String?,
    val studentId: String,
    /** Also the parent's sign-in username. */
    val admissionNo: String?,
    val name: String,
    val className: String?,
    val sectionName: String?,
    val relation: String?,
    /** REQUESTED, VERIFIED, REJECTED or REVOKED. */
    val status: String?,
) {
    val isActiveLink: Boolean get() = status != "REVOKED" && status != "REJECTED"
}

/** A one-time temporary password from creating or resetting a parent sign-in. */
data class ParentCredentials(val userEmail: String?, val userPhone: String?, val temporaryPassword: String?)
