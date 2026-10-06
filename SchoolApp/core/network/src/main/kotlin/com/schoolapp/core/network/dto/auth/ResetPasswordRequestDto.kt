package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class ResetPasswordRequestDto(val token: String, val newPassword: String)
