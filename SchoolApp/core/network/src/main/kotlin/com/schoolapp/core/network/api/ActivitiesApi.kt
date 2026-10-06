package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.activity.ActivityBodyDto
import com.schoolapp.core.network.dto.activity.ActivityDto
import com.schoolapp.core.network.dto.activity.ConsentBodyDto
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Activities, consents and participants (phase 3 contract section 5). */
interface ActivitiesApi {
    @GET("activities")
    suspend fun activities(
        @Query("branchId") branchId: String? = null,
        @Query("type") type: String? = null,
        @Query("status") status: String? = null,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): ApiEnvelope<List<ActivityDto>>

    /** Array or `{ upcoming, consentPending }`; read leniently. */
    @GET("activities/mine")
    suspend fun mine(@Query("studentId") studentId: String): ApiEnvelope<JsonElement>

    @GET("activities/{id}")
    suspend fun activity(@Path("id") id: String): ApiEnvelope<ActivityDto>

    @POST("activities")
    suspend fun propose(@Body body: ActivityBodyDto): ApiEnvelope<ActivityDto>

    @POST("activities/{id}/approve")
    suspend fun approve(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<ActivityDto>

    @POST("activities/{id}/reject")
    suspend fun reject(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<ActivityDto>

    /** Array or `{ consents|items, counts }`; read leniently. */
    @GET("activities/{id}/consents")
    suspend fun consents(@Path("id") id: String): ApiEnvelope<JsonElement>

    @POST("activities/{id}/consents")
    suspend fun decideConsent(@Path("id") id: String, @Body body: ConsentBodyDto)

    /** Array or `{ participants }`; read leniently. */
    @GET("activities/{id}/participants")
    suspend fun participants(@Path("id") id: String): ApiEnvelope<JsonElement>
}
