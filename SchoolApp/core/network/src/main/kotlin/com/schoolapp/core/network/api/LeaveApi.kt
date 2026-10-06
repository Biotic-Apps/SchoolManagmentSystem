package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.leave.LeaveBodyDto
import com.schoolapp.core.network.dto.leave.LeaveDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Student and staff leave (phase 3 contract section 3). */
interface LeaveApi {
    @GET("leave")
    suspend fun leaves(
        @Query("scope") scope: String,
        @Query("status") status: String? = null,
        @Query("branchId") branchId: String? = null,
    ): ApiEnvelope<List<LeaveDto>>

    @POST("leave")
    suspend fun request(@Body body: LeaveBodyDto): ApiEnvelope<LeaveDto>

    @POST("leave/{id}/approve")
    suspend fun approve(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<LeaveDto>

    @POST("leave/{id}/reject")
    suspend fun reject(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<LeaveDto>

    @POST("leave/{id}/cancel")
    suspend fun cancel(@Path("id") id: String, @Body body: CommentBodyDto = CommentBodyDto()): ApiEnvelope<LeaveDto>
}
