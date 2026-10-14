package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.NamedOption
import com.schoolapp.core.model.settings.NotificationSettings
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.settings.PolicySettings
import com.schoolapp.core.model.settings.SchoolSettings
import com.schoolapp.core.model.settings.SchoolSettingsInput
import com.schoolapp.core.model.settings.SmsGatewayStatus
import com.schoolapp.core.model.settings.WhatsAppMessage

/** Per-school settings: branding, notification channels, policies, WhatsApp log and SMS gateway. */
interface SettingsRepository {
    /** Active schools (super admin picker). */
    suspend fun schools(): AppResult<List<NamedOption>>

    /** Active branches of [schoolId]. */
    suspend fun branches(schoolId: String): AppResult<List<NamedOption>>

    suspend fun school(schoolId: String): AppResult<SchoolSettings>

    /** Saves and refreshes the cached app branding; returns the saved settings (or null when the API sent none). */
    suspend fun saveSchool(schoolId: String, input: SchoolSettingsInput): AppResult<SchoolSettings?>

    suspend fun notifications(schoolId: String): AppResult<NotificationSettings>

    suspend fun saveNotifications(schoolId: String, settings: NotificationSettings): AppResult<NotificationSettings?>

    suspend fun policies(schoolId: String): AppResult<PolicySettings>

    suspend fun savePolicies(schoolId: String, settings: PolicySettings): AppResult<PolicySettings?>

    suspend fun whatsAppMessages(schoolId: String, status: String?, page: Int, pageSize: Int): AppResult<PagedList<WhatsAppMessage>>

    suspend fun smsGatewayStatus(): AppResult<SmsGatewayStatus>

    /** Address a phone registers as the SMS gateway (`<api base>/sms-gateway`). */
    val smsGatewayUrl: String
}
