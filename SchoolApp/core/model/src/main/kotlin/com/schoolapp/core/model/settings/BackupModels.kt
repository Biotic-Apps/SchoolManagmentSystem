package com.schoolapp.core.model.settings

/** One database backup run (super admin). */
data class BackupRun(
    val id: String,
    val startedAt: String?,
    val finishedAt: String?,
    /** RUNNING, DONE or FAILED. */
    val status: String,
    val sizeBytes: Long?,
    val checksumSha256: String?,
    val encrypted: Boolean,
    val error: String?,
    val verify: BackupVerify,
) {
    val isRunning: Boolean get() = status == STATUS_RUNNING
    val isDone: Boolean get() = status == STATUS_DONE
    val canVerify: Boolean get() = isDone && verify.status != STATUS_RUNNING
    val isBusy: Boolean get() = isRunning || verify.status == STATUS_RUNNING

    companion object {
        const val STATUS_RUNNING = "RUNNING"
        const val STATUS_DONE = "DONE"
    }
}

/** Restore check: the backup restored into a scratch database and compared to the live one. */
data class BackupVerify(
    /** NOT_RUN, RUNNING, PASSED or FAILED. */
    val status: String,
    val at: String?,
    val checks: List<BackupCheck>,
    val error: String?,
)

data class BackupCheck(
    val name: String,
    val expected: String?,
    val actual: String?,
    val numeric: Boolean,
    val ok: Boolean,
)
