package com.schoolapp.core.network.dto.settings

import kotlinx.serialization.Serializable

@Serializable
data class EmailSwitchDto(val enabled: Boolean = false, val fromName: String? = null)

@Serializable
data class SmsSwitchDto(val enabled: Boolean = false, val senderId: String? = null)

@Serializable
data class ChannelSwitchDto(val enabled: Boolean = false)

@Serializable
data class CategoryChannelsDto(
    val category: String,
    val email: Boolean = false,
    val sms: Boolean = false,
    val push: Boolean = false,
    val whatsapp: Boolean = false,
    val inApp: Boolean = false,
)

/** GET/PATCH `/settings/notifications?schoolId=`. */
@Serializable
data class NotificationSettingsDto(
    val email: EmailSwitchDto = EmailSwitchDto(),
    val sms: SmsSwitchDto = SmsSwitchDto(),
    val push: ChannelSwitchDto = ChannelSwitchDto(),
    val whatsapp: ChannelSwitchDto = ChannelSwitchDto(),
    val categories: List<CategoryChannelsDto> = emptyList(),
)

/** Row of GET `/whatsapp/messages`. */
@Serializable
data class WhatsAppMessageDto(
    val id: String,
    val to: String? = null,
    val templateName: String? = null,
    val status: String? = null,
    val error: String? = null,
    val sentAt: String? = null,
    val createdAt: String? = null,
)
