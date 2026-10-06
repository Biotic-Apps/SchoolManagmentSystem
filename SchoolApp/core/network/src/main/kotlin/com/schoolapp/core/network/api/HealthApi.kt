package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.NoteBodyDto
import com.schoolapp.core.network.dto.health.HealthAlertDto
import com.schoolapp.core.network.dto.health.HealthChangeBodyDto
import com.schoolapp.core.network.dto.health.HealthProfileDto
import com.schoolapp.core.network.dto.health.IncidentBodyDto
import com.schoolapp.core.network.dto.health.IncidentDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Health profiles, alerts and incidents (phase 3 contract section 10). */
interface HealthApi {
    /** `data` is null when no profile was recorded yet. */
    @GET("students/{id}/health")
    suspend fun profile(@Path("id") studentId: String): ApiEnvelope<HealthProfileDto?>

    @POST("students/{id}/health/change-requests")
    suspend fun requestChange(@Path("id") studentId: String, @Body body: HealthChangeBodyDto)

    @GET("health/alerts")
    suspend fun alerts(@Query("sectionId") sectionId: String): ApiEnvelope<List<HealthAlertDto>>

    @GET("health/incidents")
    suspend fun incidents(
        @Query("studentId") studentId: String? = null,
        @Query("branchId") branchId: String? = null,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): ApiEnvelope<List<IncidentDto>>

    @POST("health/incidents")
    suspend fun reportIncident(@Body body: IncidentBodyDto): ApiEnvelope<IncidentDto>

    @POST("health/incidents/{id}/close")
    suspend fun closeIncident(@Path("id") id: String, @Body body: NoteBodyDto): ApiEnvelope<IncidentDto>
}
