package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.attendance.CorrectionBodyDto
import com.schoolapp.core.network.dto.attendance.RegisterBodyDto
import com.schoolapp.core.network.dto.attendance.RegisterDto
import com.schoolapp.core.network.dto.attendance.SectionAttendanceDto
import com.schoolapp.core.network.dto.attendance.StudentAttendanceDto
import com.schoolapp.core.network.dto.attendance.UnmarkedSectionDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Student and staff attendance (phase 3 contract sections 1-2). */
interface AttendanceApi {
    @GET("attendance/registers")
    suspend fun register(@Query("sectionId") sectionId: String, @Query("date") date: String): ApiEnvelope<RegisterDto>

    /** Register, or `{ status: "PENDING_REVIEW", approvalId }`. */
    @PUT("attendance/registers")
    suspend fun saveDraft(
        @Body body: RegisterBodyDto,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<JsonObject>

    /** Register, or `{ status: "PENDING_REVIEW", approvalId }`; 409 ALREADY_SUBMITTED, 423 RECORD_LOCKED. */
    @POST("attendance/registers/submit")
    suspend fun submit(
        @Body body: RegisterBodyDto,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<JsonObject>

    @POST("attendance/corrections")
    suspend fun requestCorrection(@Body body: CorrectionBodyDto)

    @GET("attendance/students/{id}")
    suspend fun studentHistory(
        @Path("id") studentId: String,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): ApiEnvelope<StudentAttendanceDto>

    @GET("attendance/summary")
    suspend fun summary(@Query("branchId") branchId: String?, @Query("date") date: String): ApiEnvelope<List<SectionAttendanceDto>>

    @GET("attendance/unmarked")
    suspend fun unmarked(@Query("branchId") branchId: String?, @Query("date") date: String): ApiEnvelope<List<UnmarkedSectionDto>>

    /** Own records + summary; the shape is read leniently (array or `{ entries|records|days, summary }`). */
    @GET("staff-attendance/me")
    suspend fun myStaffAttendance(@Query("from") from: String? = null, @Query("to") to: String? = null): ApiEnvelope<JsonElement>
}
