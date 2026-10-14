package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.activity.ActivityBodyDto
import com.schoolapp.core.network.dto.activity.ActivityDto
import com.schoolapp.core.network.dto.activity.ActivityStatusBodyDto
import com.schoolapp.core.network.dto.activity.ConsentBodyDto
import com.schoolapp.core.network.dto.activity.ParticipantsBodyDto
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Activities, consents and participants (phase 3 contract section 5). */
interface ActivitiesApi {
    /** Paged (default 20 per page, at most 100). */
    @GET("activities")
    suspend fun activities(
        @Query("branchId") branchId: String? = null,
        @Query("type") type: String? = null,
        @Query("status") status: String? = null,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
        @Query("page") page: Int? = null,
        @Query("pageSize") pageSize: Int? = null,
    ): ApiEnvelope<List<ActivityDto>>

    /** Array or `{ upcoming, consentPending }`; read leniently. */
    @GET("activities/mine")
    suspend fun mine(@Query("studentId") studentId: String): ApiEnvelope<JsonElement>

    @GET("activities/{id}")
    suspend fun activity(@Path("id") id: String): ApiEnvelope<ActivityDto>

    @POST("activities")
    suspend fun propose(@Body body: ActivityBodyDto): ApiEnvelope<ActivityDto>

    /** PROPOSED activities only, by the proposer or branch management. */
    @PATCH("activities/{id}")
    suspend fun update(@Path("id") id: String, @Body body: ActivityBodyDto): ApiEnvelope<ActivityDto>

    @POST("activities/{id}/approve")
    suspend fun approve(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<ActivityDto>

    @POST("activities/{id}/reject")
    suspend fun reject(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<ActivityDto>

    /** ANNOUNCED -> ONGOING -> COMPLETED; anything still open may be CANCELLED. */
    @POST("activities/{id}/status")
    suspend fun setStatus(@Path("id") id: String, @Body body: ActivityStatusBodyDto): ApiEnvelope<ActivityDto>

    /** Array or `{ consents|items, counts }`; read leniently. */
    @GET("activities/{id}/consents")
    suspend fun consents(@Path("id") id: String): ApiEnvelope<JsonElement>

    @POST("activities/{id}/consents")
    suspend fun decideConsent(@Path("id") id: String, @Body body: ConsentBodyDto)

    /** Array or `{ participants }`; read leniently. */
    @GET("activities/{id}/participants")
    suspend fun participants(@Path("id") id: String): ApiEnvelope<JsonElement>

    @PUT("activities/{id}/participants")
    suspend fun replaceParticipants(@Path("id") id: String, @Body body: ParticipantsBodyDto): ApiEnvelope<JsonElement>
}
