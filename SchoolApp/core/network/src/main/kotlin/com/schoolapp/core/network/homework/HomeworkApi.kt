package com.schoolapp.core.network.homework

import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Homework assignments and submissions — the same endpoints the web uses. */
interface HomeworkApi {
    @GET("homework")
    suspend fun list(@Query("sectionId") sectionId: String?): ApiEnvelope<List<HomeworkDto>>

    @POST("homework")
    suspend fun create(@Body body: CreateHomeworkBody): ApiEnvelope<HomeworkDto>

    @GET("homework/{id}/submissions")
    suspend fun submissions(@Path("id") homeworkId: String): ApiEnvelope<List<HomeworkSubmissionDto>>

    @POST("homework/submissions/{submissionId}/grade")
    suspend fun grade(
        @Path("submissionId") submissionId: String,
        @Body body: GradeSubmissionBody,
    ): ApiEnvelope<HomeworkSubmissionDto>

    @POST("homework/submissions/{submissionId}/return")
    suspend fun returnSubmission(
        @Path("submissionId") submissionId: String,
        @Body body: ReturnSubmissionBody,
    ): ApiEnvelope<HomeworkSubmissionDto>

    @GET("homework/student/{studentId}")
    suspend fun forStudent(@Path("studentId") studentId: String): ApiEnvelope<List<HomeworkDto>>

    /** `data` is null when the student has not submitted yet. */
    @GET("homework/{id}/submission/{studentId}")
    suspend fun studentSubmission(
        @Path("id") homeworkId: String,
        @Path("studentId") studentId: String,
    ): ApiEnvelope<HomeworkSubmissionDto?>

    @POST("homework/{id}/submit/{studentId}")
    suspend fun submit(
        @Path("id") homeworkId: String,
        @Path("studentId") studentId: String,
        @Body body: SubmitHomeworkBody,
    ): ApiEnvelope<HomeworkSubmissionDto>

    @GET("classes/{id}/subjects")
    suspend fun classSubjects(@Path("id") classId: String): ApiEnvelope<List<HomeworkSubjectDto>>
}
