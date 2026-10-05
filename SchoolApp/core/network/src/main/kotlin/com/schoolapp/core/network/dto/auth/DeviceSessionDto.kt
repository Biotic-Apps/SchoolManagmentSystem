package com.schoolapp.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class DeviceSessionDto(
    val id: String,
    val deviceName: String? = null,
    val platform: String? = null,
    val ip: String? = null,
    val createdAt: String? = null,
    val lastUsedAt: String? = null,
    val current: Boolean = false,
)
