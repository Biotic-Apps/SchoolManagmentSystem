package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.progress.HomeworkStatusBodyDto
import com.schoolapp.core.network.dto.progress.ProgressNoteBodyDto
import com.schoolapp.core.network.dto.progress.ProgressNoteDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Teacher feedback and homework completion (phase 4 contract section A3). */
interface ProgressApi {
    /** Parents receive only notes marked visible to them. */
    @GET("students/{id}/progress-notes")
    suspend fun notes(@Path("id") studentId: String): ApiEnvelope<List<ProgressNoteDto>>

    /** Note, or `{ status: "PENDING_REVIEW", approvalId }` under probation. */
    @POST("students/{id}/progress-notes")
    suspend fun addNote(@Path("id") studentId: String, @Body body: ProgressNoteBodyDto): ApiEnvelope<JsonObject>

    @PUT("diary/{id}/homework-status")
    suspend fun homeworkStatus(@Path("id") diaryId: String, @Body body: HomeworkStatusBodyDto): ApiEnvelope<JsonElement>

    /** `{ studentId, from, to, entries: HomeworkItemDto[], summary }`; read leniently (array or wrapped). */
    @GET("students/{id}/homework-completion")
    suspend fun homeworkCompletion(
        @Path("id") studentId: String,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
    ): ApiEnvelope<JsonElement>
}
