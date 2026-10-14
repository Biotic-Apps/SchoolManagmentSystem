package com.schoolapp.core.network.api.fees.ledger

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.fees.PaymentDto
import com.schoolapp.core.network.model.ApiEnvelope
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.Serializable
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import javax.inject.Singleton

@Serializable
data class ConcessionStudentDto(val id: String = "", val name: String = "", val admissionNo: String? = null)

@Serializable
data class ConcessionDto(
    val id: String = "",
    val student: ConcessionStudentDto? = null,
    val feeHead: IdNameDto? = null,
    val type: String = "PERCENT",
    val value: Long = 0,
    val from: String = "",
    val to: String? = null,
    val reason: String? = null,
    val estimateMinor: Long? = null,
    val status: String? = null,
    val requestedBy: IdNameDto? = null,
)

@Serializable
data class ConcessionBodyDto(
    val studentId: String,
    val feeHeadId: String? = null,
    val type: String,
    val value: Long,
    val from: String,
    val to: String? = null,
    val reason: String,
)

@Serializable
data class LedgerEntryDto(
    val id: String = "",
    val date: String? = null,
    val type: String? = null,
    val description: String? = null,
    val amountMinor: Long = 0,
    val balanceMinor: Long = 0,
    val invoiceNo: String? = null,
    val receiptNo: String? = null,
)

@Serializable
data class StudentLedgerDto(val entries: List<LedgerEntryDto> = emptyList(), val balanceMinor: Long = 0, val currency: String? = null)

/** Payments list, concessions and a student's fee ledger. */
interface FeesLedgerApi {
    @GET("payments")
    suspend fun payments(
        @Query("branchId") branchId: String,
        @Query("from") from: String? = null,
        @Query("to") to: String? = null,
        @Query("method") method: String? = null,
        @Query("search") search: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<PaymentDto>>

    @GET("concessions")
    suspend fun concessions(
        @Query("branchId") branchId: String,
        @Query("status") status: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<ConcessionDto>>

    /** Sent for approval (`fees.add`). */
    @POST("concessions")
    suspend fun requestConcession(@Body body: ConcessionBodyDto): ApiEnvelope<ConcessionDto>

    @GET("students/{id}/ledger")
    suspend fun ledger(@Path("id") studentId: String): ApiEnvelope<StudentLedgerDto>

    companion object {
        const val PAGE_SIZE = 100
    }
}

@Module
@InstallIn(SingletonComponent::class)
object FeesLedgerNetworkModule {
    @Provides
    @Singleton
    fun provideFeesLedgerApi(retrofit: Retrofit): FeesLedgerApi = retrofit.create(FeesLedgerApi::class.java)
}
