package com.schoolapp.core.data.fees

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.fees.PdfJob
import com.schoolapp.core.model.fees.PdfJobState
import kotlinx.coroutines.delay
import javax.inject.Inject

/**
 * Challan PDF of an invoice as a signed url: asks for the PDF, then polls its job every [POLL_INTERVAL_MS]
 * for up to [MAX_POLLS] times (~60 s). Network calls run on the IO dispatcher (ApiCaller); waiting only suspends.
 * Fails with [CODE_FAILED] when the job fails and [CODE_NOT_READY] (HTTP 202) when it is still running at the end.
 */
class InvoicePdfDownloader @Inject constructor(private val repository: FeesRepository) {

    suspend operator fun invoke(invoiceId: String): AppResult<String> {
        var job = when (val first = repository.invoicePdf(invoiceId)) {
            is AppResult.Failure -> return first
            is AppResult.Success -> first.data
        }
        repeat(MAX_POLLS) {
            job.outcome()?.let { return it }
            val jobId = job.jobId ?: return AppResult.Failure(notReady())
            delay(POLL_INTERVAL_MS)
            job = when (val next = repository.pdfJob(jobId)) {
                is AppResult.Failure -> return next
                is AppResult.Success -> next.data
            }
        }
        return job.outcome() ?: AppResult.Failure(notReady())
    }

    private fun PdfJob.outcome(): AppResult<String>? = when (state) {
        PdfJobState.READY -> fileUrl?.let { AppResult.Success(it) }
        PdfJobState.FAILED -> AppResult.Failure(AppError.Server(HTTP_SERVER_ERROR, CODE_FAILED, null))
        PdfJobState.PENDING -> null
    }

    private fun notReady() = AppError.Server(HTTP_ACCEPTED, CODE_NOT_READY, null)

    companion object {
        const val POLL_INTERVAL_MS = 2_000L
        const val MAX_POLLS = 30
        const val CODE_NOT_READY = "FILE_NOT_READY"
        const val CODE_FAILED = "PDF_FAILED"
        private const val HTTP_ACCEPTED = 202
        private const val HTTP_SERVER_ERROR = 500
    }
}
