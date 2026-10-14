package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.diary.DiaryBodyDto
import com.schoolapp.core.network.dto.diary.DiaryEntryDto
import com.schoolapp.core.network.dto.diary.MissingDiaryDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Daily diary and homework (phase 3 contract section 4). */
interface DiaryApi {
    @GET("diary")
    suspend fun entries(
        @Query("sectionId") sectionId: String? = null,
        @Query("date") date: String? = null,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
    ): ApiEnvelope<List<DiaryEntryDto>>

    /** Entry, or `{ status: "PENDING_REVIEW", approvalId }`. */
    @PUT("diary")
    suspend fun save(
        @Body body: DiaryBodyDto,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<JsonObject>

    /** Entry (PUBLISHED or SUBMITTED), or `{ status: "PENDING_REVIEW", approvalId }`. */
    @POST("diary/{id}/publish")
    suspend fun publish(
        @Path("id") id: String,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<JsonObject>

    @POST("diary/{id}/return")
    suspend fun returnEntry(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<DiaryEntryDto>

    @GET("diary/missing")
    suspend fun missing(@Query("branchId") branchId: String?, @Query("date") date: String): ApiEnvelope<List<MissingDiaryDto>>
}
