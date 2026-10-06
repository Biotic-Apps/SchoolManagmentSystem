package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.syllabus.BookListDto
import com.schoolapp.core.network.dto.syllabus.CoverageDto
import com.schoolapp.core.network.dto.syllabus.SyllabusPlanDto
import com.schoolapp.core.network.dto.syllabus.TopicProgressBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Syllabus plans, topic progress, coverage and book lists (contract section 7). */
interface SyllabusApi {
    @GET("syllabus-plans")
    suspend fun plans(
        @Query("sectionId") sectionId: String? = null,
        @Query("subjectId") subjectId: String? = null,
        @Query("sessionId") sessionId: String? = null,
    ): ApiEnvelope<List<SyllabusPlanDto>>

    /** Returns the updated topic, or `{ status: "PENDING_REVIEW", approvalId }` for staff on probation. */
    @POST("syllabus-topics/{id}/progress")
    suspend fun updateProgress(
        @Path("id") topicId: String,
        @Body body: TopicProgressBodyDto,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<JsonObject>

    @GET("syllabus/coverage")
    suspend fun coverage(
        @Query("branchId") branchId: String? = null,
        @Query("sessionId") sessionId: String? = null,
        @Query("classId") classId: String? = null,
    ): ApiEnvelope<List<CoverageDto>>

    @GET("book-lists")
    suspend fun bookLists(
        @Query("branchId") branchId: String? = null,
        @Query("classId") classId: String? = null,
    ): ApiEnvelope<List<BookListDto>>
}
