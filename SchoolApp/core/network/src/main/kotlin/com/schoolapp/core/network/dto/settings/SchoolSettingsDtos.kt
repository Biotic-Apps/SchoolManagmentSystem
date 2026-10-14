package com.schoolapp.core.network.dto.settings

import kotlinx.serialization.Serializable

/** GET/PATCH `/settings/school/:schoolId`. */
@Serializable
data class SchoolSettingsDto(
    val schoolId: String = "",
    val displayName: String? = null,
    val logoFileId: String? = null,
    val logoUrl: String? = null,
    val primaryColor: String? = null,
    val receiptFooter: String? = null,
    val reportCardFooter: String? = null,
    val timezone: String? = null,
    val currency: String? = null,
    val locale: String? = null,
)

/** PATCH body; sent through [settingsBody] so a cleared logo or footer goes out as `null`. */
@Serializable
data class SchoolSettingsBodyDto(
    val displayName: String,
    val logoFileId: String?,
    val primaryColor: String,
    val receiptFooter: String?,
    val reportCardFooter: String?,
)

/** `{ id, name }` row of `/schools` or `/branches`. */
@Serializable
data class NamedRowDto(val id: String, val name: String? = null)

/** GET `/sms-gateway/status`. */
@Serializable
data class SmsGatewayStatusDto(
    val enabled: Boolean = false,
    val deviceId: String? = null,
    val pending: Int = 0,
    val lastSentAt: String? = null,
)
