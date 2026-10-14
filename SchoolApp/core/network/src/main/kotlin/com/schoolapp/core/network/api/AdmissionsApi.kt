package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.admissions.ApplicationDto
import com.schoolapp.core.network.dto.admissions.AttachDocumentBodyDto
import com.schoolapp.core.network.dto.admissions.ConfirmBodyDto
import com.schoolapp.core.network.dto.admissions.ConfirmedApplicationDto
import com.schoolapp.core.network.dto.admissions.ConvertEnquiryBodyDto
import com.schoolapp.core.network.dto.admissions.CreateApplicationBodyDto
import com.schoolapp.core.network.dto.admissions.CreateEnquiryBodyDto
import com.schoolapp.core.network.dto.admissions.DecideBodyDto
import com.schoolapp.core.network.dto.admissions.EnquiryDto
import com.schoolapp.core.network.dto.admissions.RejectDocumentBodyDto
import com.schoolapp.core.network.dto.admissions.ScheduleTestBodyDto
import com.schoolapp.core.network.dto.admissions.TestResultBodyDto
import com.schoolapp.core.network.dto.admissions.UpdateApplicationBodyDto
import com.schoolapp.core.network.dto.admissions.UpdateEnquiryBodyDto
import com.schoolapp.core.network.dto.admissions.VerifyDocumentBodyDto
import com.schoolapp.core.network.dto.admissions.WithdrawBodyDto
import com.schoolapp.core.network.dto.people.DocumentDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** The whole admissions workflow: enquiries, applications (test, decision, confirm, withdraw), waiting list, documents. */
interface AdmissionsApi {
    @GET("admissions/enquiries")
    suspend fun enquiries(
        @Query("branchId") branchId: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<EnquiryDto>>

    @POST("admissions/enquiries")
    suspend fun createEnquiry(@Body body: CreateEnquiryBodyDto): ApiEnvelope<EnquiryDto>

    @PATCH("admissions/enquiries/{id}")
    suspend fun updateEnquiry(@Path("id") id: String, @Body body: UpdateEnquiryBodyDto): ApiEnvelope<EnquiryDto>

    @POST("admissions/enquiries/{id}/convert")
    suspend fun convertEnquiry(@Path("id") id: String, @Body body: ConvertEnquiryBodyDto): ApiEnvelope<ApplicationDto>

    @GET("admissions/applications")
    suspend fun applications(
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<ApplicationDto>>

    @POST("admissions/applications")
    suspend fun createApplication(@Body body: CreateApplicationBodyDto): ApiEnvelope<ApplicationDto>

    @GET("admissions/applications/{id}")
    suspend fun application(@Path("id") id: String): ApiEnvelope<ApplicationDto>

    @PATCH("admissions/applications/{id}")
    suspend fun updateApplication(@Path("id") id: String, @Body body: UpdateApplicationBodyDto): ApiEnvelope<ApplicationDto>

    @POST("admissions/applications/{id}/decide")
    suspend fun decide(@Path("id") id: String, @Body body: DecideBodyDto)

    @POST("admissions/applications/{id}/test")
    suspend fun scheduleTest(@Path("id") id: String, @Body body: ScheduleTestBodyDto): ApiEnvelope<ApplicationDto>

    @POST("admissions/applications/{id}/test-result")
    suspend fun testResult(@Path("id") id: String, @Body body: TestResultBodyDto): ApiEnvelope<ApplicationDto>

    @POST("admissions/applications/{id}/withdraw")
    suspend fun withdraw(@Path("id") id: String, @Body body: WithdrawBodyDto): ApiEnvelope<ApplicationDto>

    @POST("admissions/applications/{id}/confirm")
    suspend fun confirm(@Path("id") id: String, @Body body: ConfirmBodyDto): ApiEnvelope<ConfirmedApplicationDto>

    @POST("admissions/applications/{id}/documents")
    suspend fun attachDocument(@Path("id") id: String, @Body body: AttachDocumentBodyDto): ApiEnvelope<DocumentDto>

    @POST("documents/{id}/verify")
    suspend fun verifyDocument(@Path("id") id: String, @Body body: VerifyDocumentBodyDto): ApiEnvelope<DocumentDto>

    @POST("documents/{id}/reject")
    suspend fun rejectDocument(@Path("id") id: String, @Body body: RejectDocumentBodyDto): ApiEnvelope<DocumentDto>

    @GET("admissions/waiting-list")
    suspend fun waitingList(@Query("branchId") branchId: String? = null): ApiEnvelope<List<ApplicationDto>>

    @POST("admissions/waiting-list/{id}/offer")
    suspend fun offerFromWaitingList(@Path("id") id: String): ApiEnvelope<ApplicationDto>
}
