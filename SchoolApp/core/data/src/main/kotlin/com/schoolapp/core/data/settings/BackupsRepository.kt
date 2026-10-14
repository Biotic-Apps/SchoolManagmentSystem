package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.BackupRun

/** Database backups (super admin): list, run now, restore check and signed download link. */
interface BackupsRepository {
    suspend fun backups(): AppResult<List<BackupRun>>

    /** Queues a full encrypted backup; the new run shows as RUNNING in [backups]. */
    suspend fun runBackup(): AppResult<Unit>

    /** Queues a restore check of a finished backup. */
    suspend fun verify(id: String): AppResult<Unit>

    /** Short-lived signed link to the backup file. */
    suspend fun downloadUrl(id: String): AppResult<String>
}
