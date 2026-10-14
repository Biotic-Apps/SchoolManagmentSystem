package com.schoolapp.core.data.reports

import com.schoolapp.core.model.reports.RecentExport
import com.schoolapp.core.model.reports.ReportJobStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

/** Exports started while the app is running, newest first; in memory only (gone when the process ends). */
@Singleton
class RecentExportsStore @Inject constructor() {
    private val _exports = MutableStateFlow<List<RecentExport>>(emptyList())
    val exports: StateFlow<List<RecentExport>> = _exports.asStateFlow()

    fun add(export: RecentExport) = _exports.update { list ->
        (listOf(export) + list.filterNot { it.jobId == export.jobId }).take(MAX)
    }

    fun updateStatus(jobId: String, status: ReportJobStatus) = _exports.update { list ->
        list.map { if (it.jobId == jobId) it.copy(status = status, pollFailed = false) else it }
    }

    fun markPollFailed(jobId: String) = _exports.update { list ->
        list.map { if (it.jobId == jobId) it.copy(pollFailed = true) else it }
    }

    fun remove(jobId: String) = _exports.update { list -> list.filterNot { it.jobId == jobId } }

    fun clear() = _exports.update { emptyList() }

    private companion object {
        const val MAX = 20
    }
}
