package com.schoolapp.core.network.api.questions

import com.schoolapp.core.network.api.Paging
import com.schoolapp.core.network.dto.questions.CreateQuestionRequest
import com.schoolapp.core.network.dto.questions.ExamPaperDto
import com.schoolapp.core.network.dto.questions.GenerateExamPaperRequest
import com.schoolapp.core.network.dto.questions.QuestionDto
import com.schoolapp.core.network.dto.questions.UpdateExamPaperRequest
import com.schoolapp.core.network.dto.questions.UpdateQuestionRequest
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Question bank and generated exam papers — the same endpoints the web "Question Bank & Papers" page uses. */
interface QuestionsApi {
    @GET("questions")
    suspend fun questions(
        @Query("schoolId") schoolId: String?,
        @Query("subjectId") subjectId: String? = null,
        @Query("classId") classId: String? = null,
        @Query("questionType") questionType: String? = null,
        @Query("difficultyLevel") difficultyLevel: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<QuestionDto>>

    @GET("questions/{id}")
    suspend fun question(@Path("id") id: String): ApiEnvelope<QuestionDto>

    @POST("questions")
    suspend fun createQuestion(@Body body: CreateQuestionRequest): ApiEnvelope<QuestionDto>

    @PATCH("questions/{id}")
    suspend fun updateQuestion(@Path("id") id: String, @Body body: UpdateQuestionRequest): ApiEnvelope<QuestionDto>

    /** Archives the question (it leaves the bank and is no longer picked for papers). */
    @DELETE("questions/{id}")
    suspend fun archiveQuestion(@Path("id") id: String): ApiEnvelope<QuestionDto>

    @GET("exam-papers")
    suspend fun papers(
        @Query("schoolId") schoolId: String?,
        @Query("subjectId") subjectId: String? = null,
        @Query("classId") classId: String? = null,
        @Query("page") page: Int = 1,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<ExamPaperDto>>

    @GET("exam-papers/{id}")
    suspend fun paper(@Path("id") id: String): ApiEnvelope<ExamPaperDto>

    /** 400 when the bank has too few questions for a section. */
    @POST("exam-papers/generate")
    suspend fun generatePaper(@Body body: GenerateExamPaperRequest): ApiEnvelope<ExamPaperDto>

    @PATCH("exam-papers/{id}")
    suspend fun updatePaper(@Path("id") id: String, @Body body: UpdateExamPaperRequest): ApiEnvelope<ExamPaperDto>

    companion object {
        /** Streamed, printable PDF of a paper; download it through the PDF file store. */
        fun paperPdfPath(id: String): String = "exam-papers/$id/pdf"
    }
}
