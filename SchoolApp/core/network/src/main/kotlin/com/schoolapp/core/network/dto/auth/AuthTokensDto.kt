package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class AuthTokensDto(
    val accessToken: String,
    val refreshToken: String,
    val accessExpiresIn: Long? = null,
    val mustChangePassword: Boolean = false,
)
