package com.schoolapp.core.data.fees.pdf

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.FeesApi
import kotlinx.coroutines.delay
import javax.inject.Inject
import javax.inject.Singleton

/** Result of a finished background job: a signed [fileUrl] for file jobs, [count] for jobs that report one. */
data class JobOutcome(val fileUrl: String?, val count: Int?)

/**
 * Waits for a `GET /jobs/:id` job (payroll calculation, invoice generation, challan print) to finish.
 * Polls every [POLL_INTERVAL_MS] up to [MAX_POLLS] times; QUEUED/RUNNING keep waiting, DONE succeeds, FAILED fails.
 */
@Singleton
class BackgroundJobs @Inject constructor(private val api: FeesApi, private val apiCaller: ApiCaller) {

    suspend fun await(jobId: String): AppResult<JobOutcome> {
        repeat(MAX_POLLS) {
            val job = when (val result = apiCaller.call { api.job(jobId).data }) {
                is AppResult.Failure -> return result
                is AppResult.Success -> result.data
            }
            when (job.status?.uppercase()) {
                "DONE", "COMPLETED", "READY" -> {
                    val url = (job.result?.fileUrl ?: job.result?.url ?: job.fileUrl)?.takeIf { it.isNotBlank() }
                    return AppResult.Success(JobOutcome(url, job.result?.count))
                }
                "FAILED", "ERROR", "CANCELLED" ->
                    return AppResult.Failure(AppError.Server(HTTP_SERVER_ERROR, CODE_FAILED, job.error))
            }
            delay(POLL_INTERVAL_MS)
        }
        return AppResult.Failure(AppError.Server(HTTP_ACCEPTED, CODE_NOT_READY, null))
    }

    companion object {
        const val POLL_INTERVAL_MS = 2_000L
        const val MAX_POLLS = 60
        const val CODE_NOT_READY = "JOB_NOT_READY"
        const val CODE_FAILED = "JOB_FAILED"
        private const val HTTP_ACCEPTED = 202
        private const val HTTP_SERVER_ERROR = 500
    }
}
