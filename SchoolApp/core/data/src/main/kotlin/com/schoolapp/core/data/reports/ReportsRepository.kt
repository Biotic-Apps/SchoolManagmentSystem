package com.schoolapp.core.data.reports

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportJobStatus
import com.schoolapp.core.model.reports.ReportRequest

interface ReportsRepository {
    /** Reports the caller may run (the server filters by role, permission and scope). */
    suspend fun catalog(): AppResult<List<Report>>

    /** Queues an export; returns its job id. */
    suspend fun generate(request: ReportRequest): AppResult<String>

    suspend fun status(jobId: String): AppResult<ReportJobStatus>
}
