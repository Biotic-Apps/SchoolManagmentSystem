package com.schoolapp.core.network.api

import com.schoolapp.core.network.AuthHeaders
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.fees.DailyCollectionDto
import com.schoolapp.core.network.dto.fees.DuesRowDto
import com.schoolapp.core.network.dto.fees.FeeSummaryDto
import com.schoolapp.core.network.dto.fees.FileUrlDto
import com.schoolapp.core.network.dto.fees.FinanceDashboardDto
import com.schoolapp.core.network.dto.fees.InvoiceDto
import com.schoolapp.core.network.dto.fees.OnlineInitiateBodyDto
import com.schoolapp.core.network.dto.fees.OnlineInitiateDto
import com.schoolapp.core.network.dto.fees.PaymentBodyDto
import com.schoolapp.core.network.dto.fees.PaymentDto
import com.schoolapp.core.network.dto.fees.PaymentProofDto
import com.schoolapp.core.network.dto.fees.ProofBodyDto
import com.schoolapp.core.network.dto.fees.VerifyProofBodyDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Fees, payments, dues and collections (phase 4 contract section B, G finance dashboard). */
interface FeesApi {
    @GET("students/{id}/fee-summary")
    suspend fun feeSummary(@Path("id") studentId: String): ApiEnvelope<FeeSummaryDto>

    @GET("invoices")
    suspend fun invoices(
        @Query("studentId") studentId: String? = null,
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<InvoiceDto>>

    @GET("invoices/{id}")
    suspend fun invoice(@Path("id") id: String): ApiEnvelope<InvoiceDto>

    @GET("payments/{id}/receipt")
    suspend fun receipt(@Path("id") paymentId: String): ApiEnvelope<FileUrlDto>

    @POST("payment-proofs")
    suspend fun submitProof(@Body body: ProofBodyDto): ApiEnvelope<PaymentProofDto>

    @GET("payment-proofs")
    suspend fun proofs(
        @Query("branchId") branchId: String? = null,
        @Query("status") status: String? = null,
    ): ApiEnvelope<List<PaymentProofDto>>

    @POST("payment-proofs/{id}/verify")
    suspend fun verifyProof(@Path("id") id: String, @Body body: VerifyProofBodyDto): ApiEnvelope<PaymentProofDto>

    @POST("payment-proofs/{id}/reject")
    suspend fun rejectProof(@Path("id") id: String, @Body body: ReasonBodyDto): ApiEnvelope<PaymentProofDto>

    @POST("payments")
    suspend fun recordPayment(
        @Body body: PaymentBodyDto,
        @Header(AuthHeaders.IDEMPOTENCY_KEY) idempotencyKey: String,
    ): ApiEnvelope<PaymentDto>

    /** `409 GATEWAY_DISABLED` while the branch has no online gateway. */
    @POST("payments/online/initiate")
    suspend fun initiateOnline(@Body body: OnlineInitiateBodyDto): ApiEnvelope<OnlineInitiateDto>

    @GET("dues")
    suspend fun dues(
        @Query("branchId") branchId: String? = null,
        @Query("search") search: String? = null,
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<DuesRowDto>>

    @GET("collections/daily")
    suspend fun dailyCollection(@Query("branchId") branchId: String?, @Query("date") date: String): ApiEnvelope<DailyCollectionDto>

    @GET("dashboard/finance")
    suspend fun financeDashboard(
        @Query("branchId") branchId: String? = null,
        @Query("month") month: String? = null,
    ): ApiEnvelope<FinanceDashboardDto>
}
