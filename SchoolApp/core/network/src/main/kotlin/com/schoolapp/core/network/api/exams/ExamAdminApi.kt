package com.schoolapp.core.network.api.exams

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.exams.admin.ExamCreateBodyDto
import com.schoolapp.core.network.dto.exams.admin.ExamDetailDto
import com.schoolapp.core.network.dto.exams.admin.ExamPrintBodyDto
import com.schoolapp.core.network.dto.exams.admin.ExamStatusBodyDto
import com.schoolapp.core.network.dto.exams.admin.ExamUpdateBodyDto
import com.schoolapp.core.network.dto.exams.admin.JobIdDto
import com.schoolapp.core.network.dto.exams.admin.ScheduleBodyDto
import com.schoolapp.core.network.dto.fees.JobStatusDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/** Exam setup and the results workflow (create, schedule, open/close marks, compute, approve, publish, print). */
interface ExamAdminApi {
    @GET("exams/{id}")
    suspend fun exam(@Path("id") id: String): ApiEnvelope<ExamDetailDto>

    @POST("exams")
    suspend fun create(@Body body: ExamCreateBodyDto): ApiEnvelope<ExamDetailDto>

    @PATCH("exams/{id}")
    suspend fun update(@Path("id") id: String, @Body body: ExamUpdateBodyDto): ApiEnvelope<ExamDetailDto>

    /** 409 with clash details when a class sits two papers at once or a room is double booked. */
    @PUT("exams/{id}/schedule")
    suspend fun saveSchedule(@Path("id") id: String, @Body body: ScheduleBodyDto): ApiEnvelope<ExamDetailDto>

    /** MARKS_OPEN or MARKS_CLOSED. */
    @POST("exams/{id}/status")
    suspend fun setStatus(@Path("id") id: String, @Body body: ExamStatusBodyDto): ApiEnvelope<ExamDetailDto>

    @POST("exams/{id}/compute")
    suspend fun compute(@Path("id") id: String, @Body body: JsonObject = JsonObject(emptyMap())): ApiEnvelope<JobIdDto>

    /** Sends results for the principal's approval; 409 lists the sheets not yet accepted. */
    @POST("exams/{id}/approve-results")
    suspend fun approveResults(@Path("id") id: String, @Body body: JsonObject = JsonObject(emptyMap())): ApiEnvelope<ExamDetailDto>

    @POST("exams/{id}/publish")
    suspend fun publish(@Path("id") id: String, @Body body: JsonObject = JsonObject(emptyMap())): ApiEnvelope<ExamDetailDto>

    /** Queues a bulk exam PDF; poll [job] for the file. */
    @POST("exams/{id}/print")
    suspend fun print(@Path("id") id: String, @Body body: ExamPrintBodyDto): ApiEnvelope<JobIdDto>

    /** Subjects taught in a class (schedule subject picker). */
    @GET("classes/{id}/subjects")
    suspend fun classSubjects(@Path("id") classId: String): ApiEnvelope<List<IdNameDto>>

    @GET("sessions/{id}/terms")
    suspend fun sessionTerms(@Path("id") sessionId: String): ApiEnvelope<List<IdNameDto>>

    @GET("jobs/{id}")
    suspend fun job(@Path("id") jobId: String): ApiEnvelope<JobStatusDto>
}
