package com.schoolapp.core.model.profile

data class DeviceSession(
    val id: String,
    val deviceName: String?,
    val platform: String?,
    val ip: String?,
    val createdAt: String?,
    val lastUsedAt: String?,
    val current: Boolean,
)
