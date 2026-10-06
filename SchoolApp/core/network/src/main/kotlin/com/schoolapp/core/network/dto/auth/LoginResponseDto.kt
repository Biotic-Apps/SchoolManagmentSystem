package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

/** `POST /auth/login`: tokens, or `{ twoFactorRequired: true, challengeId }` when the account uses 2FA. */
@Serializable
data class LoginResponseDto(
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val accessExpiresIn: Long? = null,
    val mustChangePassword: Boolean = false,
    val twoFactorRequired: Boolean = false,
    val challengeId: String? = null,
)
