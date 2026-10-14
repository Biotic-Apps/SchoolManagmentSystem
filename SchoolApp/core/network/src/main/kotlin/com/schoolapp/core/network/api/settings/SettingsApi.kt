package com.schoolapp.core.network.api.settings

import com.schoolapp.core.network.api.Paging
import com.schoolapp.core.network.dto.settings.NamedRowDto
import com.schoolapp.core.network.dto.settings.NotificationSettingsDto
import com.schoolapp.core.network.dto.settings.PoliciesDto
import com.schoolapp.core.network.dto.settings.SchoolSettingsDto
import com.schoolapp.core.network.dto.settings.SmsGatewayStatusDto
import com.schoolapp.core.network.dto.settings.WhatsAppMessageDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query

/** Settings & Backups (phase 5 contract §A): school, notifications, policies, WhatsApp log, SMS gateway. */
interface SettingsApi {
    @GET("settings/school/{schoolId}")
    suspend fun school(@Path("schoolId") schoolId: String): ApiEnvelope<SchoolSettingsDto>

    @PATCH("settings/school/{schoolId}")
    suspend fun saveSchool(@Path("schoolId") schoolId: String, @Body body: JsonObject): ApiEnvelope<SchoolSettingsDto?>

    @GET("settings/notifications")
    suspend fun notifications(@Query("schoolId") schoolId: String): ApiEnvelope<NotificationSettingsDto>

    @PATCH("settings/notifications")
    suspend fun saveNotifications(@Query("schoolId") schoolId: String, @Body body: JsonObject): ApiEnvelope<NotificationSettingsDto?>

    @GET("settings/policies")
    suspend fun policies(@Query("schoolId") schoolId: String): ApiEnvelope<PoliciesDto>

    @PATCH("settings/policies")
    suspend fun savePolicies(@Query("schoolId") schoolId: String, @Body body: JsonObject): ApiEnvelope<PoliciesDto?>

    @GET("whatsapp/messages")
    suspend fun whatsAppMessages(
        @Query("schoolId") schoolId: String,
        @Query("status") status: String?,
        @Query("page") page: Int,
        @Query("pageSize") pageSize: Int,
    ): ApiEnvelope<List<WhatsAppMessageDto>>

    @GET("sms-gateway/status")
    suspend fun smsGatewayStatus(): ApiEnvelope<SmsGatewayStatusDto>

    /** Active schools for the super admin's school picker. */
    @GET("schools")
    suspend fun schools(
        @Query("status") status: String = "ACTIVE",
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<NamedRowDto>>

    /** Active branches of one school (Data import). */
    @GET("branches")
    suspend fun branches(
        @Query("schoolId") schoolId: String,
        @Query("status") status: String = "ACTIVE",
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<NamedRowDto>>
}
