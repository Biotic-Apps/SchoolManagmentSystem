package com.schoolapp.core.network.dto.me

import kotlinx.serialization.Serializable

@Serializable
data class MeUserDto(
    val id: String,
    val name: String,
    val email: String? = null,
    val phone: String? = null,
    val mustChangePassword: Boolean = false,
    val twoFactorEnabled: Boolean = false,
)
