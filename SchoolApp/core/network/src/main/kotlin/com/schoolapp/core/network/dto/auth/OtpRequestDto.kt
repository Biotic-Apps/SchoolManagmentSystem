package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

/** `POST /auth/otp/request`: the server normalises [phone] to E.164. */
@Serializable
data class OtpRequestDto(val phone: String)
