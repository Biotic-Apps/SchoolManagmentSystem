package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class ChangePasswordRequestDto(val currentPassword: String, val newPassword: String)
