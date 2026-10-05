package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequestDto(
    val identifier: String,
    val password: String,
    val platform: String = PLATFORM_ANDROID,
    val deviceName: String? = null,
) {
    companion object {
        const val PLATFORM_ANDROID = "ANDROID"
    }
}
