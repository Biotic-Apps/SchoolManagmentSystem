package com.schoolapp.core.model.reports

enum class ReportJobState {
    QUEUED, RUNNING, DONE, FAILED;

    val isFinished: Boolean get() = this == DONE || this == FAILED
}

/** `GET /reports/{jobId}`: [fileUrl] is a signed download link once [state] is DONE. */
data class ReportJobStatus(
    val state: ReportJobState,
    val fileUrl: String?,
    val rowCount: Int?,
    val error: String?,
)

/** An export started from this device while the app is open (kept in memory, like the web's tab list). */
data class RecentExport(
    val jobId: String,
    val title: String,
    val request: ReportRequest,
    /** ISO-8601 UTC instant. */
    val startedAt: String,
    val status: ReportJobStatus = ReportJobStatus(ReportJobState.QUEUED, null, null, null),
    /** Set when polling itself failed (network/permission), not the job. */
    val pollFailed: Boolean = false,
)
