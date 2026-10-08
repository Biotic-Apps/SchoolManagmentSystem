package com.schoolapp.core.network.dto.staff

import kotlinx.serialization.Serializable

/** `POST /staff/:id/account` body; omitted email / phone default to the staff record's, role to the designation. */
@Serializable
data class CreateStaffAccountRequest(
    val email: String? = null,
    val phone: String? = null,
    val roleKey: String? = null,
)

/** `POST /staff/:id/account` response; [temporaryPassword] only when a new login was generated (shown once). */
@Serializable
data class StaffAccountDto(
    val userId: String,
    val email: String? = null,
    val phone: String? = null,
    val temporaryPassword: String? = null,
)

/** `POST /staff/:id/account/reset-password` response. */
@Serializable
data class StaffPasswordResetDto(val userId: String, val temporaryPassword: String)
