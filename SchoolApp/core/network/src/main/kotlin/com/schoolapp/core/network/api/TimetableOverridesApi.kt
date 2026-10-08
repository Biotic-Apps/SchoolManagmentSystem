package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.timetable.CreateOverrideRequest
import com.schoolapp.core.network.dto.timetable.TimetableOverrideDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Day substitutions (absent-teacher cover): list needs `timetable.view`, writes `timetable.edit`. */
interface TimetableOverridesApi {
    @GET("timetable-overrides")
    suspend fun overrides(
        @Query("branchId") branchId: String? = null,
        @Query("date") date: String? = null,
    ): ApiEnvelope<List<TimetableOverrideDto>>

    /** Notifies the substitute; 409 when the period already has one. */
    @POST("timetable-overrides")
    suspend fun create(@Body body: CreateOverrideRequest): ApiEnvelope<TimetableOverrideDto>

    /** Cancels the substitution; the period goes back to the timetabled teacher. */
    @DELETE("timetable-overrides/{id}")
    suspend fun cancel(@Path("id") id: String): ApiEnvelope<TimetableOverrideDto>
}
