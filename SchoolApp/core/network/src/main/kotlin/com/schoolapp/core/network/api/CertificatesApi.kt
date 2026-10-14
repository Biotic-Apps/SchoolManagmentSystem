package com.schoolapp.core.network.api

import com.schoolapp.core.network.dto.certificates.CertificateBodyDto
import com.schoolapp.core.network.dto.certificates.CertificateDto
import com.schoolapp.core.network.dto.certificates.IssueCertificateBodyDto
import com.schoolapp.core.network.dto.common.CommentBodyDto
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Certificates (phase 4 contract section F). */
interface CertificatesApi {
    @GET("certificates")
    suspend fun certificates(
        @Query("studentId") studentId: String? = null,
        @Query("status") status: String? = null,
        @Query("branchId") branchId: String? = null,
    ): ApiEnvelope<List<CertificateDto>>

    @POST("certificates")
    suspend fun request(@Body body: CertificateBodyDto): ApiEnvelope<CertificateDto>

    /** `409 CLEARANCE_REQUIRED` with details for leaving/transfer certificates with dues or unreturned items. */
    @POST("certificates/{id}/approve")
    suspend fun approve(@Path("id") id: String, @Body body: CommentBodyDto): ApiEnvelope<CertificateDto>

    @POST("certificates/{id}/reject")
    suspend fun reject(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<CertificateDto>

    @GET("certificates/{id}")
    suspend fun certificate(@Path("id") id: String): ApiEnvelope<CertificateDto>

    /** APPROVED -> ISSUED with a serial; starts the PDF job (`jobId`). Leaving certificates withdraw the student. */
    @POST("certificates/{id}/issue")
    suspend fun issue(@Path("id") id: String, @Body body: IssueCertificateBodyDto): ApiEnvelope<CertificateDto>

    /** A DUPLICATE copy of an issued original (same serial); starts its PDF job. */
    @POST("certificates/{id}/reissue")
    suspend fun reissue(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<CertificateDto>
}
