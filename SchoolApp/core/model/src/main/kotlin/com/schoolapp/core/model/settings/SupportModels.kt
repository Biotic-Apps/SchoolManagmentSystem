package com.schoolapp.core.model.settings

/** Settings › Support system health tiles. */
data class SystemHealth(
    val dbOk: Boolean,
    val queueDriver: String?,
    val queueWaiting: Int,
    val queueFailed: Int,
    val storageDriver: String?,
    val storageOk: Boolean,
    val lastBackupAt: String?,
    val lastRestoreVerified: String?,
    val version: String?,
)

/** A notification delivery that could not be sent. */
data class FailedNotification(
    val id: String,
    val recipientName: String?,
    val recipientContact: String?,
    val channel: String?,
    val category: String?,
    val attempts: Int,
    val lastError: String?,
    val at: String?,
)

data class FailedNotificationFilters(
    val channel: String? = null,
    val from: String? = null,
    val to: String? = null,
)

/** A background job run (invoices, reports, PDFs, imports, …). */
data class JobRun(
    val id: String,
    val queue: String,
    val name: String,
    val status: String,
    val attempts: Int?,
    val error: String?,
    val startedAt: String?,
    val finishedAt: String?,
)

data class JobFilters(
    val queue: String? = null,
    val status: String? = DEFAULT_STATUS,
    val from: String? = null,
) {
    companion object {
        const val DEFAULT_STATUS = "FAILED"
    }
}

/** Provider answer of a test message; [error] is set when [ok] is false. */
data class TestMessageResult(val ok: Boolean, val error: String?)
