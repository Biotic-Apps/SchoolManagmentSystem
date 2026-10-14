package com.schoolapp.feature.reports.catalog

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.reports.RecentExportsStore
import com.schoolapp.core.data.reports.ReportsRepository
import com.schoolapp.core.model.reports.RecentExport
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Polls each unfinished export every [POLL_MS] until it is DONE or FAILED (like the web's 2 s poll).
 * A failed poll stops that export's loop and marks it, so the row can offer "Check again".
 */
class ExportPoller @Inject constructor(
    private val repository: ReportsRepository,
    private val store: RecentExportsStore,
) {
    private val jobs = mutableMapOf<String, Job>()

    fun sync(scope: CoroutineScope, exports: List<RecentExport>) {
        jobs.entries.removeAll { (_, job) -> !job.isActive }
        exports.filter { !it.status.state.isFinished && !it.pollFailed && it.jobId !in jobs }
            .forEach { export -> jobs[export.jobId] = scope.launch { poll(export.jobId) } }
    }

    private suspend fun poll(jobId: String) {
        while (kotlinx.coroutines.currentCoroutineContext().isActive) {
            when (val result = repository.status(jobId)) {
                is AppResult.Failure -> {
                    store.markPollFailed(jobId)
                    return
                }
                is AppResult.Success -> {
                    store.updateStatus(jobId, result.data)
                    if (result.data.state.isFinished) return
                }
            }
            delay(POLL_MS)
        }
    }

    private companion object {
        const val POLL_MS = 2_000L
    }
}
