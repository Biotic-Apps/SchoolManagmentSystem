package com.schoolapp.core.data.fees

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.fees.PdfJob
import com.schoolapp.core.model.fees.PdfJobState
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.fees.JobStatusDto
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.currentTime
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import java.lang.reflect.Proxy

@OptIn(ExperimentalCoroutinesApi::class)
class InvoicePdfDownloaderTest {

    /** Fees stub answering `invoicePdf` with [first] and each `pdfJob` with the next of [polls] (last one repeats). */
    private class Stub(private val first: AppResult<PdfJob>, private val polls: List<AppResult<PdfJob>>) {
        var pollCalls = 0
        val repository: FeesRepository = Proxy.newProxyInstance(
            FeesRepository::class.java.classLoader, arrayOf(FeesRepository::class.java),
        ) { _, method, _ ->
            when (method.name) {
                "invoicePdf" -> first
                "pdfJob" -> polls[minOf(pollCalls++, polls.lastIndex)]
                else -> error("not used: ${method.name}")
            }
        } as FeesRepository
    }

    private fun job(state: PdfJobState, url: String? = null) = AppResult.Success(PdfJob("j1", state, url))

    @Test
    fun ready_at_once_returns_the_url_without_polling() = runTest {
        val stub = Stub(job(PdfJobState.READY, "https://f/c.pdf"), emptyList())
        assertEquals(AppResult.Success("https://f/c.pdf"), InvoicePdfDownloader(stub.repository)("inv1"))
        assertEquals(0, stub.pollCalls)
    }

    @Test
    fun pending_polls_every_two_seconds_until_ready() = runTest {
        val stub = Stub(job(PdfJobState.PENDING), listOf(job(PdfJobState.PENDING), job(PdfJobState.READY, "https://f/c.pdf")))
        val result = InvoicePdfDownloader(stub.repository)("inv1")
        assertEquals(AppResult.Success("https://f/c.pdf"), result)
        assertEquals(2, stub.pollCalls)
        assertEquals(2 * InvoicePdfDownloader.POLL_INTERVAL_MS, currentTime)
    }

    @Test
    fun failed_job_reports_pdf_failed() = runTest {
        val stub = Stub(job(PdfJobState.PENDING), listOf(job(PdfJobState.FAILED)))
        val error = (InvoicePdfDownloader(stub.repository)("inv1") as AppResult.Failure).error as AppError.Server
        assertEquals(InvoicePdfDownloader.CODE_FAILED, error.code)
    }

    @Test
    fun still_pending_after_about_a_minute_reports_not_ready() = runTest {
        val stub = Stub(job(PdfJobState.PENDING), listOf(job(PdfJobState.PENDING)))
        val error = (InvoicePdfDownloader(stub.repository)("inv1") as AppResult.Failure).error as AppError.Server
        assertEquals(InvoicePdfDownloader.CODE_NOT_READY, error.code)
        assertEquals(InvoicePdfDownloader.MAX_POLLS, stub.pollCalls)
        assertEquals(60_000L, currentTime)
    }

    @Test
    fun request_failure_is_passed_through() = runTest {
        val stub = Stub(AppResult.Failure(AppError.Network), emptyList())
        assertEquals(AppResult.Failure(AppError.Network), InvoicePdfDownloader(stub.repository)("inv1"))
    }

    @Test
    fun job_status_done_or_completed_reads_the_result_url() {
        val done = NetworkJson.decodeFromString(JobStatusDto.serializer(), """{"id":"j1","status":"COMPLETED","result":{"fileUrl":"https://f/c.pdf"}}""")
        assertEquals(PdfJob("j1", PdfJobState.READY, "https://f/c.pdf"), done.toPdfJob())
        val running = NetworkJson.decodeFromString(JobStatusDto.serializer(), """{"id":"j1","status":"DONE","result":null}""")
        assertEquals(PdfJobState.PENDING, running.toPdfJob().state)
        val failed = NetworkJson.decodeFromString(JobStatusDto.serializer(), """{"id":"j1","status":"FAILED"}""")
        assertEquals(PdfJobState.FAILED, failed.toPdfJob().state)
    }
}
