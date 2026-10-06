package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.admissions.ApplicationDto
import com.schoolapp.core.network.dto.admissions.DecideBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Admissions on mobile: list, read-only detail and the offer/waitlist/reject decision (contract section 1). */
interface AdmissionsApi {
    @GET("admissions/applications")
    suspend fun applications(
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<ApplicationDto>>

    @GET("admissions/applications/{id}")
    suspend fun application(@Path("id") id: String): ApiEnvelope<ApplicationDto>

    @POST("admissions/applications/{id}/decide")
    suspend fun decide(@Path("id") id: String, @Body body: DecideBodyDto)
}
