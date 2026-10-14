package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.organisation.AcademicSessionDto
import com.schoolapp.core.network.dto.organisation.BranchDto
import com.schoolapp.core.network.dto.organisation.CalendarEventDto
import com.schoolapp.core.network.dto.organisation.CreateBranchRequest
import com.schoolapp.core.network.dto.organisation.CreateCalendarEventRequest
import com.schoolapp.core.network.dto.organisation.SessionRequest
import com.schoolapp.core.network.dto.organisation.SessionTermDto
import com.schoolapp.core.network.dto.organisation.SetPrincipalRequest
import com.schoolapp.core.network.dto.organisation.TermRequest
import com.schoolapp.core.network.dto.organisation.UserOptionDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Branch, session, term and calendar editing — the same endpoints as the web Branches and Sessions pages. */
interface OrganisationEditApi {
    @POST("branches")
    suspend fun createBranch(@Body body: CreateBranchRequest): ApiEnvelope<BranchDto>

    /** Body built by hand so explicit nulls clear contacts. */
    @PATCH("branches/{id}")
    suspend fun updateBranch(@Path("id") id: String, @Body body: JsonObject): ApiEnvelope<BranchDto>

    /** [action] = `archive` or `activate`. */
    @POST("branches/{id}/{action}")
    suspend fun branchStatus(@Path("id") id: String, @Path("action") action: String): Response<Unit>

    @PUT("branches/{id}/principal")
    suspend fun setPrincipal(@Path("id") id: String, @Body body: SetPrincipalRequest): Response<Unit>

    @GET("branches/{id}/settings")
    suspend fun branchSettings(@Path("id") id: String): ApiEnvelope<JsonObject>

    @PATCH("branches/{id}/settings")
    suspend fun updateBranchSettings(@Path("id") id: String, @Body body: JsonObject): Response<Unit>

    @POST("sessions")
    suspend fun createSession(@Body body: SessionRequest): ApiEnvelope<AcademicSessionDto>

    @PATCH("sessions/{id}")
    suspend fun updateSession(@Path("id") id: String, @Body body: SessionRequest): ApiEnvelope<AcademicSessionDto>

    /** [action] = `activate` or `close`. */
    @POST("sessions/{id}/{action}")
    suspend fun sessionTransition(@Path("id") id: String, @Path("action") action: String): Response<Unit>

    @GET("sessions/{id}/terms")
    suspend fun terms(@Path("id") sessionId: String): ApiEnvelope<List<SessionTermDto>>

    @POST("sessions/{id}/terms")
    suspend fun createTerm(@Path("id") sessionId: String, @Body body: TermRequest): ApiEnvelope<SessionTermDto>

    @PATCH("terms/{id}")
    suspend fun updateTerm(@Path("id") id: String, @Body body: TermRequest): ApiEnvelope<SessionTermDto>

    @DELETE("terms/{id}")
    suspend fun deleteTerm(@Path("id") id: String): Response<Unit>

    @POST("calendar")
    suspend fun createEvent(@Body body: CreateCalendarEventRequest): ApiEnvelope<CalendarEventDto>

    /** Body built by hand so an explicit null clears the description. */
    @PATCH("calendar/{id}")
    suspend fun updateEvent(@Path("id") id: String, @Body body: JsonObject): ApiEnvelope<CalendarEventDto>

    @DELETE("calendar/{id}")
    suspend fun deleteEvent(@Path("id") id: String): Response<Unit>

    /** Active users holding [role] (e.g. `PRINCIPAL`) for pickers. */
    @GET("users")
    suspend fun users(
        @Query("role") role: String,
        @Query("status") status: String = "ACTIVE",
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<UserOptionDto>>

    @GET("schools")
    suspend fun schools(
        @Query("status") status: String = "ACTIVE",
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<IdNameDto>>
}
