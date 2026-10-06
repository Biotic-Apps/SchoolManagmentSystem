package com.schoolapp.core.network.dto.device

import kotlinx.serialization.Serializable

/** `POST /devices` body. */
@Serializable
data class DeviceBodyDto(val token: String, val platform: String = PLATFORM_ANDROID) {
    companion object {
        const val PLATFORM_ANDROID = "ANDROID"
    }
}
