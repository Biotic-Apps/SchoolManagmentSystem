package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.exams.ExamDto
import com.schoolapp.core.network.dto.exams.MarkSheetBodyDto
import com.schoolapp.core.network.dto.exams.MarkSheetDto
import com.schoolapp.core.network.dto.exams.ReportCardDto
import com.schoolapp.core.network.dto.exams.StudentResultDto
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

/** Exams, mark sheets and results (phase 4 contract section A2). */
interface ExamsApi {
    @GET("exams")
    suspend fun exams(
        @Query("branchId") branchId: String? = null,
        @Query("sessionId") sessionId: String? = null,
        @Query("status") status: String? = null,
    ): ApiEnvelope<List<ExamDto>>

    /** Teachers get their own subject-sections only. */
    @GET("exams/{id}/mark-sheets")
    suspend fun markSheets(
        @Path("id") examId: String,
        @Query("sectionId") sectionId: String? = null,
        @Query("subjectId") subjectId: String? = null,
    ): ApiEnvelope<List<MarkSheetDto>>

    @GET("mark-sheets/{id}")
    suspend fun markSheet(@Path("id") id: String): ApiEnvelope<MarkSheetDto>

    @PUT("mark-sheets/{id}")
    suspend fun saveMarks(
        @Path("id") id: String,
        @Body body: MarkSheetBodyDto,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<MarkSheetDto>

    /** Sheet, or `{ status: "PENDING_REVIEW", approvalId }` under probation; 400 while any row is pending. */
    @POST("mark-sheets/{id}/submit")
    suspend fun submit(
        @Path("id") id: String,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<JsonObject>

    @POST("mark-sheets/{id}/accept")
    suspend fun accept(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<MarkSheetDto>

    @POST("mark-sheets/{id}/return")
    suspend fun returnSheet(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<MarkSheetDto>

    /** Published results with the trend: `{ results, trend }` (a plain array is also accepted). */
    @GET("students/{id}/results")
    suspend fun studentResults(@Path("id") studentId: String): ApiEnvelope<JsonElement>

    @GET("results")
    suspend fun results(@Query("examId") examId: String, @Query("sectionId") sectionId: String? = null): ApiEnvelope<List<StudentResultDto>>

    @GET("students/{id}/report-cards")
    suspend fun reportCard(@Path("id") studentId: String, @Query("examId") examId: String): ApiEnvelope<ReportCardDto>
}
