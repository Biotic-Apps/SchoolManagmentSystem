package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

/** `POST /auth/otp/request`: the server matches [email] case-insensitively. */
@Serializable
data class OtpRequestDto(val email: String)
