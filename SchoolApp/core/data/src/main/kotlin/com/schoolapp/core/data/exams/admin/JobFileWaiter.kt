package com.schoolapp.core.data.exams.admin

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.exams.ExamAdminApi
import kotlinx.coroutines.delay
import javax.inject.Inject

/**
 * Polls `GET /jobs/:id` every [POLL_INTERVAL_MS] (up to [MAX_POLLS] times, about a minute) until the job finishes.
 * [awaitFile] needs a file url in the result; [awaitDone] only needs the job to finish.
 * Network calls run on IO (ApiCaller); waiting only suspends.
 */
class JobFileWaiter @Inject constructor(
    private val api: ExamAdminApi,
    private val apiCaller: ApiCaller,
) {
    suspend fun awaitFile(jobId: String): AppResult<String> {
        repeat(MAX_POLLS) { attempt ->
            if (attempt > 0) delay(POLL_INTERVAL_MS)
            val job = when (val next = apiCaller.call { api.job(jobId).data }) {
                is AppResult.Failure -> return next
                is AppResult.Success -> next.data
            }
            val status = job.status?.uppercase()
            if (status in FAILED) return AppResult.Failure(failed())
            val url = (job.result?.fileUrl ?: job.result?.url ?: job.fileUrl)?.takeIf { it.isNotBlank() }
            if (url != null) return AppResult.Success(url)
        }
        return AppResult.Failure(notReady())
    }

    suspend fun awaitDone(jobId: String): AppResult<Unit> {
        repeat(MAX_POLLS) { attempt ->
            if (attempt > 0) delay(POLL_INTERVAL_MS)
            val job = when (val next = apiCaller.call { api.job(jobId).data }) {
                is AppResult.Failure -> return next
                is AppResult.Success -> next.data
            }
            when (job.status?.uppercase()) {
                in FAILED -> return AppResult.Failure(failed())
                in DONE -> return AppResult.Success(Unit)
            }
        }
        return AppResult.Failure(notReady())
    }

    private fun failed() = AppError.Server(HTTP_SERVER_ERROR, CODE_FAILED, null)

    private fun notReady() = AppError.Server(HTTP_ACCEPTED, CODE_NOT_READY, null)

    companion object {
        const val POLL_INTERVAL_MS = 2_000L
        const val MAX_POLLS = 30
        const val CODE_NOT_READY = "FILE_NOT_READY"
        const val CODE_FAILED = "PDF_FAILED"
        private const val HTTP_ACCEPTED = 202
        private const val HTTP_SERVER_ERROR = 500
        private val FAILED = setOf("FAILED", "ERROR", "CANCELLED")
        private val DONE = setOf("DONE", "COMPLETED", "SUCCEEDED", "SUCCESS", "READY", "FINISHED")
    }
}
