package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.people.ChildLinkChallengeDto
import com.schoolapp.core.network.dto.people.ChildLinkRequestDto
import com.schoolapp.core.network.dto.people.ChildLinkStartBodyDto
import com.schoolapp.core.network.dto.people.ContactChangeBodyDto
import com.schoolapp.core.network.dto.people.GuardianDto
import com.schoolapp.core.network.dto.people.OtpBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Guardians, parent child-link requests and contact changes (contract section 4). */
interface GuardiansApi {
    @GET("guardians")
    suspend fun guardians(
        @Query("branchId") branchId: String? = null,
        @Query("search") search: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<GuardianDto>>

    @GET("child-links")
    suspend fun childLinks(
        @Query("status") status: String? = "REQUESTED",
        @Query("branchId") branchId: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<ChildLinkRequestDto>>

    @POST("child-links/request")
    suspend fun requestChildLink(@Body body: ChildLinkStartBodyDto): ApiEnvelope<ChildLinkChallengeDto>

    @POST("child-links/{requestId}/otp")
    suspend fun verifyChildLinkOtp(@Path("requestId") requestId: String, @Body body: OtpBodyDto)

    @POST("guardians/me/contact-change")
    suspend fun requestContactChange(@Body body: ContactChangeBodyDto)
}
