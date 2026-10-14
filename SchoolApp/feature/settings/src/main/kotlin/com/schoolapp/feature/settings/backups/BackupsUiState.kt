package com.schoolapp.feature.settings.backups

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.settings.BackupRun

@Immutable
internal data class BackupsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val runs: List<BackupRun> = emptyList(),
    val confirmRun: Boolean = false,
    val starting: Boolean = false,
    val verifyingId: String? = null,
    val downloadingId: String? = null,
    /** Signed link to open once, then [BackupsViewModel.downloadOpened]. */
    val downloadUrl: String? = null,
    val checksRunId: String? = null,
    val message: BackupMessage? = null,
    val actionError: AppError? = null,
) {
    val backupRunning: Boolean get() = runs.any { it.isRunning }
    val verifyRunning: Boolean get() = runs.any { it.verify.status == STATUS_RUNNING }
    val checksRun: BackupRun? get() = runs.firstOrNull { it.id == checksRunId }

    private companion object {
        const val STATUS_RUNNING = "RUNNING"
    }
}

internal enum class BackupMessage { BACKUP_STARTED, VERIFY_STARTED }
