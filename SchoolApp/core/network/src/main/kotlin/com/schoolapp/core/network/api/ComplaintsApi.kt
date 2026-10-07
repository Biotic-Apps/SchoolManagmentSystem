package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.complaint.AssignComplaintBodyDto
import com.schoolapp.core.network.dto.complaint.ComplaintBodyDto
import com.schoolapp.core.network.dto.complaint.ComplaintDto
import com.schoolapp.core.network.dto.complaint.ComplaintUpdateBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Complaints (phase 3 contract section 8). Actions answer the complaint, or another object (read leniently). */
interface ComplaintsApi {
    @GET("complaints")
    suspend fun complaints(
        @Query("box") box: String,
        @Query("status") status: String? = null,
        @Query("category") category: String? = null,
    ): ApiEnvelope<List<ComplaintDto>>

    @GET("complaints/{id}")
    suspend fun complaint(@Path("id") id: String): ApiEnvelope<ComplaintDto>

    @POST("complaints")
    suspend fun file(@Body body: ComplaintBodyDto): ApiEnvelope<ComplaintDto>

    @POST("complaints/{id}/assign")
    suspend fun assign(@Path("id") id: String, @Body body: AssignComplaintBodyDto): ApiEnvelope<JsonObject>

    @POST("complaints/{id}/updates")
    suspend fun addUpdate(@Path("id") id: String, @Body body: ComplaintUpdateBodyDto): ApiEnvelope<JsonObject>

    @POST("complaints/{id}/escalate")
    suspend fun escalate(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<JsonObject>

    @POST("complaints/{id}/close")
    suspend fun close(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<JsonObject>

    @POST("complaints/{id}/reopen")
    suspend fun reopen(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<JsonObject>
}
