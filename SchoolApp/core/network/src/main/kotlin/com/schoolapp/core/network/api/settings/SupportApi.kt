package com.schoolapp.core.network.api.settings

import com.schoolapp.core.network.dto.settings.FailedNotificationDto
import com.schoolapp.core.network.dto.settings.JobRunDto
import com.schoolapp.core.network.dto.settings.ResendAllBodyDto
import com.schoolapp.core.network.dto.settings.SystemHealthDto
import com.schoolapp.core.network.dto.settings.TestMessageBodyDto
import com.schoolapp.core.network.dto.settings.TestMessageResultDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Settings › Support (phase 5 contract §C): super admin only. */
interface SupportApi {
    @GET("support/health")
    suspend fun health(): ApiEnvelope<SystemHealthDto>

    @GET("support/notifications/failed")
    suspend fun failedNotifications(
        @Query("schoolId") schoolId: String?,
        @Query("channel") channel: String?,
        @Query("from") from: String?,
        @Query("to") to: String?,
        @Query("page") page: Int,
        @Query("pageSize") pageSize: Int,
    ): ApiEnvelope<List<FailedNotificationDto>>

    @POST("support/notifications/failed/resend-all")
    suspend fun resendAll(@Body body: ResendAllBodyDto)

    @POST("support/notifications/failed/{id}/resend")
    suspend fun resend(@Path("id") id: String)

    @GET("support/jobs")
    suspend fun jobs(
        @Query("queue") queue: String?,
        @Query("status") status: String?,
        @Query("from") from: String?,
        @Query("page") page: Int,
        @Query("pageSize") pageSize: Int,
    ): ApiEnvelope<List<JobRunDto>>

    @POST("support/jobs/{id}/retry")
    suspend fun retryJob(@Path("id") id: String)

    @POST("support/test-message")
    suspend fun testMessage(@Body body: TestMessageBodyDto): ApiEnvelope<TestMessageResultDto>
}
