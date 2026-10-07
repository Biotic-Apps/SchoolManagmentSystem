package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.organisation.AcademicSessionDto
import com.schoolapp.core.network.dto.organisation.BranchDto
import com.schoolapp.core.network.dto.organisation.CalendarEventDto
import com.schoolapp.core.network.dto.organisation.SchoolClassDto
import com.schoolapp.core.network.dto.organisation.SectionDto
import com.schoolapp.core.network.dto.organisation.SubjectDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/** Read-only organisation endpoints used on mobile. */
interface OrganisationApi {
    @GET("branches")
    suspend fun branches(
        @Query("schoolId") schoolId: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<BranchDto>>

    @GET("branches/{id}")
    suspend fun branch(@Path("id") id: String): ApiEnvelope<BranchDto>

    @GET("branches/{id}/settings")
    suspend fun branchSettings(@Path("id") id: String): ApiEnvelope<JsonObject>

    @GET("sessions")
    suspend fun sessions(
        @Query("branchId") branchId: String?,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<AcademicSessionDto>>

    @GET("calendar")
    suspend fun calendar(
        @Query("branchId") branchId: String?,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<CalendarEventDto>>

    /** Parent view: school + branch events for the student's branch; server default range is today..+90 days. */
    @GET("students/{studentId}/calendar")
    suspend fun studentCalendar(
        @Path("studentId") studentId: String,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): ApiEnvelope<List<CalendarEventDto>>

    @GET("classes")
    suspend fun classes(
        @Query("schoolId") schoolId: String?,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<SchoolClassDto>>

    @GET("sections")
    suspend fun sections(
        @Query("branchId") branchId: String?,
        @Query("sessionId") sessionId: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<SectionDto>>

    @GET("subjects")
    suspend fun subjects(
        @Query("schoolId") schoolId: String?,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<SubjectDto>>
}
