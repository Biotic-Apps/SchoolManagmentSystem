package com.schoolapp.core.network.dto.notification

import kotlinx.serialization.Serializable

@Serializable
data class NotificationPreferenceDto(
    val category: String,
    val inApp: Boolean = true,
    val push: Boolean = true,
    val critical: Boolean = false,
)

/** One item of the `PUT /notifications/preferences` array body. */
@Serializable
data class PreferenceInputDto(val category: String, val push: Boolean, val inApp: Boolean? = null)
