package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.pickup.DepartureBodyDto
import com.schoolapp.core.network.dto.pickup.DepartureDto
import com.schoolapp.core.network.dto.pickup.EarlyLeaveBodyDto
import com.schoolapp.core.network.dto.pickup.EarlyLeaveDto
import com.schoolapp.core.network.dto.pickup.PickupPersonBodyDto
import com.schoolapp.core.network.dto.pickup.PickupPersonDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Pickup persons, early leave and departures (phase 3 contract section 11). */
interface PickupApi {
    @GET("students/{id}/pickup-persons")
    suspend fun pickupPersons(@Path("id") studentId: String): ApiEnvelope<List<PickupPersonDto>>

    @POST("students/{id}/pickup-persons")
    suspend fun addPickupPerson(@Path("id") studentId: String, @Body body: PickupPersonBodyDto): ApiEnvelope<PickupPersonDto>

    @POST("early-leave")
    suspend fun requestEarlyLeave(@Body body: EarlyLeaveBodyDto): ApiEnvelope<EarlyLeaveDto>

    @GET("early-leave")
    suspend fun earlyLeaves(
        @Query("branchId") branchId: String? = null,
        @Query("date") date: String? = null,
        @Query("status") status: String? = null,
    ): ApiEnvelope<List<EarlyLeaveDto>>

    @POST("early-leave/{id}/approve")
    suspend fun approveEarlyLeave(@Path("id") id: String, @Body body: CommentBodyDto = CommentBodyDto()): ApiEnvelope<EarlyLeaveDto>

    @POST("early-leave/{id}/reject")
    suspend fun rejectEarlyLeave(@Path("id") id: String, @Body body: CommentBodyDto = CommentBodyDto()): ApiEnvelope<EarlyLeaveDto>

    /** `403 PICKUP_NOT_AUTHORIZED` when the picker is not verified. */
    @POST("departures")
    suspend fun recordDeparture(@Body body: DepartureBodyDto): ApiEnvelope<DepartureDto>

    @GET("departures")
    suspend fun departures(@Query("branchId") branchId: String? = null, @Query("date") date: String): ApiEnvelope<List<DepartureDto>>
}
