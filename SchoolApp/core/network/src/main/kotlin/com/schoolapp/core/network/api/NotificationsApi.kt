package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.notification.NotificationDto
import com.schoolapp.core.network.dto.notification.NotificationPreferenceDto
import com.schoolapp.core.network.dto.notification.PreferenceInputDto
import com.schoolapp.core.network.dto.notification.UnreadCountDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface NotificationsApi {
    @GET("notifications")
    suspend fun list(
        @Query("unread") unread: Boolean? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<NotificationDto>>

    @GET("notifications/unread-count")
    suspend fun unreadCount(): ApiEnvelope<UnreadCountDto>

    @POST("notifications/{id}/read")
    suspend fun markRead(@Path("id") id: String)

    @POST("notifications/read-all")
    suspend fun markAllRead()

    @GET("notifications/preferences")
    suspend fun preferences(): ApiEnvelope<List<NotificationPreferenceDto>>

    /** Plain array body `[{ category, push, inApp? }]`. */
    @PUT("notifications/preferences")
    suspend fun updatePreferences(@Body body: List<PreferenceInputDto>): ApiEnvelope<List<NotificationPreferenceDto>>
}
