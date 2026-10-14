package com.schoolapp.core.data.fees.invoices

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.pdf.BackgroundJobs
import com.schoolapp.core.data.fees.pdf.JobOutcome
import com.schoolapp.core.data.fees.pdf.PdfFileStore
import com.schoolapp.core.data.fees.toModel
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.fees.invoices.AdhocInvoiceBodyDto
import com.schoolapp.core.network.api.fees.invoices.AdhocLineBodyDto
import com.schoolapp.core.network.api.fees.invoices.CancelInvoiceBodyDto
import com.schoolapp.core.network.api.fees.invoices.GenerateInvoicesBodyDto
import com.schoolapp.core.network.api.fees.invoices.InvoiceAdminApi
import com.schoolapp.core.network.api.fees.invoices.IssueInvoicesBodyDto
import com.schoolapp.core.network.api.fees.invoices.PrintChallansBodyDto
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import javax.inject.Inject
import javax.inject.Singleton

data class InvoiceFilter(val status: InvoiceStatus? = null, val classId: String? = null, val period: String? = null, val search: String? = null)

data class AdhocLine(val feeHeadId: String, val description: String, val amountMinor: Long)

/** Issued count and the reasons drafts could not be issued. */
data class IssueResult(val issued: Int, val failures: List<String>)

interface InvoiceAdminRepository {
    suspend fun invoices(branchId: String, filter: InvoiceFilter): AppResult<List<Invoice>>

    /** Generates invoices from approved plans and waits for the job; returns how many were made when reported. */
    suspend fun generate(branchId: String, sessionId: String, period: String, classIds: List<String>): AppResult<Int?>

    suspend fun issue(invoiceIds: List<String>): AppResult<IssueResult>

    suspend fun create(studentId: String, dueDate: String, lines: List<AdhocLine>): AppResult<Invoice>

    /** Returns the invoice after the request: CANCELLED, or unchanged while the cancellation waits for approval. */
    suspend fun cancel(invoiceId: String, reason: String): AppResult<Invoice>

    /** Bulk challan PDF; returns the signed file url. */
    suspend fun printChallans(branchId: String, period: String, classId: String?, sectionId: String?): AppResult<String>

    /** Combined challan of the open invoices of the students' family; returns a local content uri. */
    suspend fun familyChallan(branchId: String, studentIds: List<String>): AppResult<String>
}

@Singleton
class DefaultInvoiceAdminRepository @Inject constructor(
    private val api: InvoiceAdminApi,
    private val apiCaller: ApiCaller,
    private val jobs: BackgroundJobs,
    private val pdfs: PdfFileStore,
) : InvoiceAdminRepository {

    override suspend fun invoices(branchId: String, filter: InvoiceFilter) = apiCaller.call {
        api.invoices(branchId, filter.status?.name, filter.classId, filter.period, filter.search?.trim()?.takeIf { it.isNotEmpty() })
            .data.map { it.toModel() }
    }

    override suspend fun generate(branchId: String, sessionId: String, period: String, classIds: List<String>): AppResult<Int?> {
        val job = when (val started = apiCaller.call { api.generate(GenerateInvoicesBodyDto(branchId, sessionId, period, classIds.ifEmpty { null })).data }) {
            is AppResult.Failure -> return started
            is AppResult.Success -> started.data
        }
        val jobId = job.jobId ?: return AppResult.Success(job.count)
        return when (val done = jobs.await(jobId)) {
            is AppResult.Failure -> done
            is AppResult.Success -> AppResult.Success(done.data.count)
        }
    }

    override suspend fun issue(invoiceIds: List<String>) = apiCaller.call {
        val result = api.issue(IssueInvoicesBodyDto(invoiceIds)).data
        IssueResult(result.issued, result.failed.mapNotNull { it.reason })
    }

    override suspend fun create(studentId: String, dueDate: String, lines: List<AdhocLine>) = apiCaller.call {
        api.create(AdhocInvoiceBodyDto(studentId, dueDate, lines.map { AdhocLineBodyDto(it.feeHeadId, it.description.trim(), it.amountMinor) }))
            .data.toModel()
    }

    override suspend fun cancel(invoiceId: String, reason: String) =
        apiCaller.call { api.cancel(invoiceId, CancelInvoiceBodyDto(reason.trim())).data.toModel() }

    override suspend fun printChallans(branchId: String, period: String, classId: String?, sectionId: String?): AppResult<String> {
        val job = when (val started = apiCaller.call { api.printChallans(PrintChallansBodyDto(branchId, period, classId, sectionId)).data }) {
            is AppResult.Failure -> return started
            is AppResult.Success -> started.data
        }
        val jobId = job.jobId ?: return AppResult.Failure(AppError.Unknown())
        return when (val done = jobs.await(jobId)) {
            is AppResult.Failure -> done
            is AppResult.Success -> done.data.fileUrl()
        }
    }

    override suspend fun familyChallan(branchId: String, studentIds: List<String>): AppResult<String> {
        val body = buildJsonObject {
            put("branchId", branchId)
            putJsonArray("studentIds") { studentIds.forEach { add(it) } }
        }
        return pdfs.post("invoices/challans/family", body, "family-challan.pdf")
    }

    private fun JobOutcome.fileUrl(): AppResult<String> =
        fileUrl?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(HTTP_NOT_FOUND, CODE_NO_FILE, null))

    private companion object {
        const val HTTP_NOT_FOUND = 404
        const val CODE_NO_FILE = "NO_CHALLANS"
    }
}

@Module
@InstallIn(SingletonComponent::class)
interface InvoiceAdminDataModule {
    @Binds
    fun bindInvoiceAdminRepository(impl: DefaultInvoiceAdminRepository): InvoiceAdminRepository
}
