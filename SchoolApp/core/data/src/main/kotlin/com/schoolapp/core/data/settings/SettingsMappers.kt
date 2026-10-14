package com.schoolapp.core.data.settings

import com.schoolapp.core.model.settings.CategoryChannels
import com.schoolapp.core.model.settings.LateFeeDefault
import com.schoolapp.core.model.settings.NamedOption
import com.schoolapp.core.model.settings.NotificationSettings
import com.schoolapp.core.model.settings.PolicySettings
import com.schoolapp.core.model.settings.SchoolSettings
import com.schoolapp.core.model.settings.SchoolSettingsInput
import com.schoolapp.core.model.settings.SmsGatewayStatus
import com.schoolapp.core.model.settings.WhatsAppMessage
import com.schoolapp.core.network.dto.settings.CategoryChannelsDto
import com.schoolapp.core.network.dto.settings.ChannelSwitchDto
import com.schoolapp.core.network.dto.settings.EmailSwitchDto
import com.schoolapp.core.network.dto.settings.LateFeeDefaultDto
import com.schoolapp.core.network.dto.settings.NamedRowDto
import com.schoolapp.core.network.dto.settings.NotificationSettingsDto
import com.schoolapp.core.network.dto.settings.PasswordPolicyDto
import com.schoolapp.core.network.dto.settings.PoliciesDto
import com.schoolapp.core.network.dto.settings.SchoolSettingsBodyDto
import com.schoolapp.core.network.dto.settings.SchoolSettingsDto
import com.schoolapp.core.network.dto.settings.SmsGatewayStatusDto
import com.schoolapp.core.network.dto.settings.SmsSwitchDto
import com.schoolapp.core.network.dto.settings.WhatsAppMessageDto

internal const val DEFAULT_PRIMARY = "#7B68EE"
private const val DEFAULT_LOCK_TIME = "11:00"
private const val DEFAULT_PASSWORD_MIN = 8
private const val DEFAULT_SESSION_TIMEOUT = 60

internal fun SchoolSettingsDto.toModel() = SchoolSettings(
    schoolId = schoolId,
    displayName = displayName.orEmpty(),
    logoFileId = logoFileId,
    logoUrl = logoUrl,
    primaryColor = primaryColor?.takeIf { it.isNotBlank() }?.uppercase() ?: DEFAULT_PRIMARY,
    receiptFooter = receiptFooter,
    reportCardFooter = reportCardFooter,
    timezone = timezone,
    currency = currency,
    locale = locale,
)

internal fun SchoolSettingsInput.toDto() =
    SchoolSettingsBodyDto(displayName, logoFileId, primaryColor, receiptFooter, reportCardFooter)

internal fun NotificationSettingsDto.toModel() = NotificationSettings(
    emailEnabled = email.enabled,
    emailFromName = email.fromName,
    smsEnabled = sms.enabled,
    smsSenderId = sms.senderId,
    pushEnabled = push.enabled,
    whatsappEnabled = whatsapp.enabled,
    categories = categories.map { CategoryChannels(it.category, it.inApp, it.email, it.sms, it.whatsapp, it.push) },
)

internal fun NotificationSettings.toDto() = NotificationSettingsDto(
    email = EmailSwitchDto(emailEnabled, emailFromName),
    sms = SmsSwitchDto(smsEnabled, smsSenderId),
    push = ChannelSwitchDto(pushEnabled),
    whatsapp = ChannelSwitchDto(whatsappEnabled),
    categories = categories.map { CategoryChannelsDto(it.category, it.email, it.sms, it.push, it.whatsapp, it.inApp) },
)

internal fun PoliciesDto.toModel() = PolicySettings(
    attendanceLockTime = attendanceLockTime?.takeIf { it.isNotBlank() } ?: DEFAULT_LOCK_TIME,
    diaryModeration = diaryModeration,
    gradingDefault = gradingDefault,
    lateFee = feeLateFeeDefault?.let { LateFeeDefault(it.amountMinor, it.afterDays) },
    approvalLimits = approvalLimits,
    passwordMinLength = passwordPolicy.minLength ?: DEFAULT_PASSWORD_MIN,
    requireDigit = passwordPolicy.requireDigit == true,
    sessionTimeoutMinutes = sessionTimeoutMinutes ?: DEFAULT_SESSION_TIMEOUT,
    twoFactorRequiredFor = twoFactorRequiredFor,
)

internal fun PolicySettings.toDto() = PoliciesDto(
    attendanceLockTime = attendanceLockTime,
    diaryModeration = diaryModeration,
    gradingDefault = gradingDefault,
    feeLateFeeDefault = lateFee?.let { LateFeeDefaultDto(it.amountMinor, it.afterDays) },
    approvalLimits = approvalLimits,
    passwordPolicy = PasswordPolicyDto(passwordMinLength, requireDigit),
    sessionTimeoutMinutes = sessionTimeoutMinutes,
    twoFactorRequiredFor = twoFactorRequiredFor,
)

internal fun WhatsAppMessageDto.toModel() = WhatsAppMessage(
    id = id,
    to = to.orEmpty(),
    templateName = templateName.orEmpty(),
    status = status.orEmpty(),
    error = error,
    sentAt = sentAt,
    createdAt = createdAt,
)

internal fun SmsGatewayStatusDto.toModel() = SmsGatewayStatus(enabled, deviceId, pending, lastSentAt)

internal fun NamedRowDto.toOption() = NamedOption(id, name?.takeIf { it.isNotBlank() } ?: id)
