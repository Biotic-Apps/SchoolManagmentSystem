package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.notice.NoticeBodyDto
import com.schoolapp.core.network.dto.notice.NoticeDto
import com.schoolapp.core.network.dto.notice.NoticeReadsDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Notices: paged list, drafts, publish, read receipts. */
interface NoticesApi {
    @GET("notices")
    suspend fun notices(
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
        @Query("page") page: Int? = null,
        @Query("pageSize") pageSize: Int? = null,
    ): ApiEnvelope<List<NoticeDto>>

    @POST("notices")
    suspend fun create(@Body body: NoticeBodyDto): ApiEnvelope<NoticeDto>

    /** Drafts only, by their author. */
    @PATCH("notices/{id}")
    suspend fun update(@Path("id") id: String, @Body body: NoticeBodyDto): ApiEnvelope<NoticeDto>

    /** Notice, or `{ status: "PENDING_REVIEW", approvalId }` when it goes to the principal. */
    @POST("notices/{id}/publish")
    suspend fun publish(@Path("id") id: String): ApiEnvelope<JsonObject>

    @POST("notices/{id}/read")
    suspend fun markRead(@Path("id") id: String)

    @GET("notices/{id}/reads")
    suspend fun reads(@Path("id") id: String): ApiEnvelope<NoticeReadsDto>
}
