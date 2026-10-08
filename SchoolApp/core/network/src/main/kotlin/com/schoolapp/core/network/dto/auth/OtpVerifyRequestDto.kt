package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

/** `POST /auth/otp/verify`: answers with the same body as `POST /auth/login` ([LoginResponseDto]). */
@Serializable
data class OtpVerifyRequestDto(
    val email: String,
    val code: String,
    val platform: String = LoginRequestDto.PLATFORM_ANDROID,
    val deviceName: String? = null,
)
