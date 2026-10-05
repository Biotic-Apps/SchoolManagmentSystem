package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.approval.ApprovalDto
import com.schoolapp.core.network.dto.approval.DecisionRequestDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApprovalsApi {
    @GET("approvals")
    suspend fun list(
        @Query("status") status: String? = null,
        @Query("type") type: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<ApprovalDto>>

    @GET("approvals/{id}")
    suspend fun detail(@Path("id") id: String): ApiEnvelope<ApprovalDto>

    @POST("approvals/{id}/decide")
    suspend fun decide(@Path("id") id: String, @Body body: DecisionRequestDto)
}
