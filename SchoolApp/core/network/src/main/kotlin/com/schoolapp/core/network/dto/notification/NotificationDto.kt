package com.schoolapp.core.network.dto.notification

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class NotificationDto(
    val id: String,
    val category: String? = null,
    val title: String = "",
    val body: String? = null,
    val data: JsonElement? = null,
    val readAt: String? = null,
    val createdAt: String? = null,
)
