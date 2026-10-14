package com.schoolapp.core.network.api.fees.invoices

import com.schoolapp.core.network.dto.fees.InvoiceDto
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
data class GenerateInvoicesBodyDto(val branchId: String, val sessionId: String, val period: String, val classIds: List<String>? = null)

@Serializable
data class InvoiceJobDto(val jobId: String? = null, val count: Int? = null)

@Serializable
data class IssueInvoicesBodyDto(val invoiceIds: List<String>)

@Serializable
data class IssueFailureDto(val id: String = "", val reason: String? = null)

@Serializable
data class IssueResultDto(val issued: Int = 0, val failed: List<IssueFailureDto> = emptyList())

@Serializable
data class AdhocLineBodyDto(val feeHeadId: String, val description: String, val amountMinor: Long)

@Serializable
data class AdhocInvoiceBodyDto(val studentId: String, val dueDate: String, val lines: List<AdhocLineBodyDto>)

@Serializable
data class CancelInvoiceBodyDto(val reason: String)

@Serializable
data class PrintChallansBodyDto(val branchId: String, val period: String, val classId: String? = null, val sectionId: String? = null)

/** Staff invoice work: list, generate from fee plans, issue drafts, ad-hoc invoices, cancel, bulk challans. */
interface InvoiceAdminApi {
    @GET("invoices")
    suspend fun invoices(
        @Query("branchId") branchId: String,
        @Query("status") status: String? = null,
        @Query("classId") classId: String? = null,
        @Query("period") period: String? = null,
        @Query("search") search: String? = null,
        @Query("pageSize") pageSize: Int = PAGE_SIZE,
    ): ApiEnvelope<List<InvoiceDto>>

    /** Queues generation from approved fee plans; poll the job. */
    @POST("invoices/generate")
    suspend fun generate(@Body body: GenerateInvoicesBodyDto): ApiEnvelope<InvoiceJobDto>

    @POST("invoices/issue")
    suspend fun issue(@Body body: IssueInvoicesBodyDto): ApiEnvelope<IssueResultDto>

    @POST("invoices")
    suspend fun create(@Body body: AdhocInvoiceBodyDto): ApiEnvelope<InvoiceDto>

    /** Cancels a draft, or raises an approval for an issued invoice. */
    @POST("invoices/{id}/cancel")
    suspend fun cancel(@Path("id") id: String, @Body body: CancelInvoiceBodyDto): ApiEnvelope<InvoiceDto>

    /** One PDF of 3-copy bank challans for a month; poll the job for the file. */
    @POST("invoices/challans/print")
    suspend fun printChallans(@Body body: PrintChallansBodyDto): ApiEnvelope<InvoiceJobDto>

    companion object {
        const val PAGE_SIZE = 100
    }
}

@Module
@InstallIn(SingletonComponent::class)
object InvoiceAdminNetworkModule {
    @Provides
    @Singleton
    fun provideInvoiceAdminApi(retrofit: Retrofit): InvoiceAdminApi = retrofit.create(InvoiceAdminApi::class.java)
}
