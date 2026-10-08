package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.staff.CreateStaffAccountRequest
import com.schoolapp.core.network.dto.staff.CreateStaffRequest
import com.schoolapp.core.network.dto.staff.StaffAccountDto
import com.schoolapp.core.network.dto.staff.StaffPasswordResetDto
import com.schoolapp.core.network.dto.staff.CreatedStaffDto
import com.schoolapp.core.network.dto.staff.StaffDetailDto
import com.schoolapp.core.network.dto.staff.StaffStatusRequest
import com.schoolapp.core.network.dto.staff.StaffSummaryDto
import com.schoolapp.core.network.dto.staff.StaffWorkloadDto
import com.schoolapp.core.network.dto.staff.UpdateStaffRequest
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Staff endpoints (contract section 5); writes need `staff.add` / `staff.edit`. */
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

    @POST("staff")
    suspend fun create(@Body body: CreateStaffRequest): ApiEnvelope<CreatedStaffDto>

    @PATCH("staff/{id}")
    suspend fun update(@Path("id") id: String, @Body body: UpdateStaffRequest): ApiEnvelope<StaffDetailDto>

    @POST("staff/{id}/status")
    suspend fun setStatus(@Path("id") id: String, @Body body: StaffStatusRequest): ApiEnvelope<StaffDetailDto>

    /** Sign-in for a staff member without one (`staff.edit` + `users.add`); 409 when they already have a login. */
    @POST("staff/{id}/account")
    suspend fun createAccount(@Path("id") id: String, @Body body: CreateStaffAccountRequest): ApiEnvelope<StaffAccountDto>

    /** New temporary password (`staff.edit` + `users.edit`). */
    @POST("staff/{id}/account/reset-password")
    suspend fun resetPassword(@Path("id") id: String): ApiEnvelope<StaffPasswordResetDto>
}
