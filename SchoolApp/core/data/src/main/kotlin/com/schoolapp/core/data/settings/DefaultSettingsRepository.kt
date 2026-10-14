package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.branding.BrandingRepository
import com.schoolapp.core.model.settings.NamedOption
import com.schoolapp.core.model.settings.NotificationSettings
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.model.settings.PolicySettings
import com.schoolapp.core.model.settings.SchoolSettings
import com.schoolapp.core.model.settings.SchoolSettingsInput
import com.schoolapp.core.model.settings.SmsGatewayStatus
import com.schoolapp.core.model.settings.WhatsAppMessage
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.settings.SettingsApi
import com.schoolapp.core.network.di.ApiBaseUrl
import com.schoolapp.core.network.dto.settings.NotificationSettingsDto
import com.schoolapp.core.network.dto.settings.PoliciesDto
import com.schoolapp.core.network.dto.settings.SchoolSettingsBodyDto
import com.schoolapp.core.network.dto.settings.settingsBody
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultSettingsRepository @Inject constructor(
    private val api: SettingsApi,
    private val apiCaller: ApiCaller,
    private val branding: BrandingRepository,
    private val auth: AuthRepository,
    @ApiBaseUrl private val baseUrl: String,
) : SettingsRepository {

    override val smsGatewayUrl: String get() = baseUrl.trimEnd('/') + "/sms-gateway"

    override suspend fun schools(): AppResult<List<NamedOption>> =
        apiCaller.call { api.schools().data.map { it.toOption() }.sortedBy { it.name.lowercase() } }

    override suspend fun branches(schoolId: String): AppResult<List<NamedOption>> =
        apiCaller.call { api.branches(schoolId).data.map { it.toOption() } }

    override suspend fun school(schoolId: String): AppResult<SchoolSettings> =
        apiCaller.call { api.school(schoolId).data.toModel() }

    override suspend fun saveSchool(schoolId: String, input: SchoolSettingsInput): AppResult<SchoolSettings?> {
        val result = apiCaller.call {
            api.saveSchool(schoolId, settingsBody(SchoolSettingsBodyDto.serializer(), input.toDto())).data?.toModel()
        }
        // The top bar follows the new name, logo and colour (same school the shell brands with).
        if (result is AppResult.Success) {
            val shellSchoolId = auth.session.first()?.activeAssignments?.firstNotNullOfOrNull { it.schoolId }
            branding.refresh(shellSchoolId)
        }
        return result
    }

    override suspend fun notifications(schoolId: String): AppResult<NotificationSettings> =
        apiCaller.call { api.notifications(schoolId).data.toModel() }

    override suspend fun saveNotifications(schoolId: String, settings: NotificationSettings): AppResult<NotificationSettings?> =
        apiCaller.call {
            api.saveNotifications(schoolId, settingsBody(NotificationSettingsDto.serializer(), settings.toDto())).data?.toModel()
        }

    override suspend fun policies(schoolId: String): AppResult<PolicySettings> =
        apiCaller.call { api.policies(schoolId).data.toModel() }

    override suspend fun savePolicies(schoolId: String, settings: PolicySettings): AppResult<PolicySettings?> =
        apiCaller.call { api.savePolicies(schoolId, settingsBody(PoliciesDto.serializer(), settings.toDto())).data?.toModel() }

    override suspend fun whatsAppMessages(
        schoolId: String,
        status: String?,
        page: Int,
        pageSize: Int,
    ): AppResult<PagedList<WhatsAppMessage>> = apiCaller.call {
        val envelope = api.whatsAppMessages(schoolId, status, page, pageSize)
        val items = envelope.data.map { it.toModel() }
        PagedList(items, page, pageSize, envelope.meta?.total ?: items.size)
    }

    override suspend fun smsGatewayStatus(): AppResult<SmsGatewayStatus> =
        apiCaller.call { api.smsGatewayStatus().data.toModel() }
}
