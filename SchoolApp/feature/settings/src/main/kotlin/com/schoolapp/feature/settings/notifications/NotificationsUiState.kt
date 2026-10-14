package com.schoolapp.feature.settings.notifications

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.settings.CategoryChannels
import com.schoolapp.core.model.settings.NotificationSettings
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.settings.WhatsAppMessage

/** Delivery channels a category can use; In-app is always available. */
internal enum class Channel { IN_APP, EMAIL, SMS, WHATSAPP, PUSH }

@Immutable
internal data class NotificationForm(
    val emailEnabled: Boolean = false,
    val emailFromName: String = "",
    val smsEnabled: Boolean = false,
    val smsSenderId: String = "",
    val whatsappEnabled: Boolean = false,
    val pushEnabled: Boolean = false,
    val categories: List<CategoryChannels> = emptyList(),
) {
    fun channelOn(channel: Channel): Boolean = when (channel) {
        Channel.IN_APP -> true
        Channel.EMAIL -> emailEnabled
        Channel.SMS -> smsEnabled
        Channel.WHATSAPP -> whatsappEnabled
        Channel.PUSH -> pushEnabled
    }

    fun toSettings() = NotificationSettings(
        emailEnabled = emailEnabled,
        emailFromName = emailFromName.trim().ifBlank { null },
        smsEnabled = smsEnabled,
        smsSenderId = smsSenderId.trim().ifBlank { null },
        pushEnabled = pushEnabled,
        whatsappEnabled = whatsappEnabled,
        categories = categories,
    )

    companion object {
        fun from(settings: NotificationSettings) = NotificationForm(
            emailEnabled = settings.emailEnabled,
            emailFromName = settings.emailFromName.orEmpty(),
            smsEnabled = settings.smsEnabled,
            smsSenderId = settings.smsSenderId.orEmpty(),
            whatsappEnabled = settings.whatsappEnabled,
            pushEnabled = settings.pushEnabled,
            categories = settings.categories,
        )
    }
}

internal fun CategoryChannels.isOn(channel: Channel): Boolean = when (channel) {
    Channel.IN_APP -> inApp
    Channel.EMAIL -> email
    Channel.SMS -> sms
    Channel.WHATSAPP -> whatsapp
    Channel.PUSH -> push
}

internal fun CategoryChannels.with(channel: Channel, on: Boolean): CategoryChannels = when (channel) {
    Channel.IN_APP -> copy(inApp = on)
    Channel.EMAIL -> copy(email = on)
    Channel.SMS -> copy(sms = on)
    Channel.WHATSAPP -> copy(whatsapp = on)
    Channel.PUSH -> copy(push = on)
}

/** Field problems found before saving. */
internal enum class NotificationProblem { FROM_NAME_REQUIRED, SENDER_ID_REQUIRED }

@Immutable
internal data class NotificationsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val loaded: Boolean = false,
    val initial: NotificationForm = NotificationForm(),
    val form: NotificationForm = NotificationForm(),
    val problems: Set<NotificationProblem> = emptySet(),
    val serverErrors: Map<String, String> = emptyMap(),
    val saving: Boolean = false,
    val saved: Boolean = false,
    val saveError: AppError? = null,
    val log: WhatsAppLogState = WhatsAppLogState(),
) {
    val dirty: Boolean get() = form != initial
}

@Immutable
internal data class WhatsAppLogState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val status: String? = null,
    val page: Int = 1,
    val result: PagedList<WhatsAppMessage>? = null,
) {
    companion object {
        const val PAGE_SIZE = 20
    }
}
