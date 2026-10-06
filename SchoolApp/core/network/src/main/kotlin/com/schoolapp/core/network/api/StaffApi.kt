package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.staff.StaffDetailDto
import com.schoolapp.core.network.dto.staff.StaffSummaryDto
import com.schoolapp.core.network.dto.staff.StaffWorkloadDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/** Read-only staff endpoints (contract section 5). */
interface StaffApi {
    @GET("staff")
    suspend fun staff(
        @Query("branchId") branchId: String? = null,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<StaffSummaryDto>>

    @GET("staff/{id}")
    suspend fun staffMember(@Path("id") id: String): ApiEnvelope<StaffDetailDto>

    @GET("staff/{id}/workload")
    suspend fun workload(@Path("id") id: String, @Query("sessionId") sessionId: String? = null): ApiEnvelope<StaffWorkloadDto>
}
