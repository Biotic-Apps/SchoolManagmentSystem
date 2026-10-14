package com.schoolapp.core.network.schools

import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Super admin school management (API SchoolsController, SchoolDeletionController, SchoolSetupController). */
interface SchoolsApi {
    @GET("schools")
    suspend fun schools(
        @Query("search") search: String? = null,
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = 25,
    ): ApiEnvelope<List<SchoolDto>>

    @GET("schools/{id}")
    suspend fun school(@Path("id") id: String): ApiEnvelope<SchoolDto>

    /** Partial update; a JSON null clears a field (`logoFileId: null` removes the logo). */
    @PATCH("schools/{id}")
    suspend fun update(@Path("id") id: String, @Body body: JsonObject): ApiEnvelope<SchoolDto>

    @POST("schools/{id}/archive")
    suspend fun archive(@Path("id") id: String): ApiEnvelope<SchoolDto>

    @POST("schools/{id}/activate")
    suspend fun activate(@Path("id") id: String): ApiEnvelope<SchoolDto>

    @GET("schools/{id}/deletion-preview")
    suspend fun deletionPreview(@Path("id") id: String): ApiEnvelope<SchoolDeletionPreviewDto>

    @GET("schools/{id}/deletion-status")
    suspend fun deletionStatus(@Path("id") id: String): ApiEnvelope<SchoolDeletionStatusDto>

    /** Starts the background purge; the body must repeat the school code. */
    @HTTP(method = "DELETE", path = "schools/{id}", hasBody = true)
    suspend fun delete(@Path("id") id: String, @Body body: DeleteSchoolBody): ApiEnvelope<SchoolDeletionStatusDto>

    /** One-form provisioning: school, main branch, principal, session, classes and bell schedule. */
    @POST("schools/setup")
    suspend fun setup(@Body body: SchoolSetupBody): ApiEnvelope<SchoolSetupResultDto>
}
