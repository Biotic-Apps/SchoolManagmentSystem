package com.schoolapp.core.model.settings

/** Delivery channels of the school and their per-category defaults. */
data class NotificationSettings(
    val emailEnabled: Boolean,
    val emailFromName: String?,
    val smsEnabled: Boolean,
    val smsSenderId: String?,
    val pushEnabled: Boolean,
    val whatsappEnabled: Boolean,
    val categories: List<CategoryChannels>,
)

data class CategoryChannels(
    val category: String,
    val inApp: Boolean,
    val email: Boolean,
    val sms: Boolean,
    val whatsapp: Boolean,
    val push: Boolean,
)

/** Row of the WhatsApp message log. */
data class WhatsAppMessage(
    val id: String,
    val to: String,
    val templateName: String,
    val status: String,
    val error: String?,
    val sentAt: String?,
    val createdAt: String?,
)
