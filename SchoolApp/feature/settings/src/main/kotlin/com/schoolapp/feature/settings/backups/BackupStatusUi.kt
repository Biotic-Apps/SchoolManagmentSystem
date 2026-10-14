package com.schoolapp.feature.settings.backups

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R

internal fun backupStatusTone(status: String): StatusTone = when (status) {
    "DONE" -> StatusTone.Success
    "RUNNING" -> StatusTone.Info
    "FAILED" -> StatusTone.Error
    else -> StatusTone.Neutral
}

@Composable
internal fun backupStatusLabel(status: String): String = when (status) {
    "DONE" -> stringResource(R.string.settings_backups_status_done)
    "RUNNING" -> stringResource(R.string.settings_backups_status_running)
    "FAILED" -> stringResource(R.string.settings_backups_status_failed)
    else -> humanizeKey(status)
}

internal fun verifyStatusTone(status: String): StatusTone = when (status) {
    "PASSED" -> StatusTone.Success
    "RUNNING" -> StatusTone.Info
    "FAILED" -> StatusTone.Error
    else -> StatusTone.Neutral
}

@Composable
internal fun verifyStatusLabel(status: String): String = when (status) {
    "PASSED" -> stringResource(R.string.settings_backups_verify_passed)
    "RUNNING" -> stringResource(R.string.settings_backups_status_running)
    "FAILED" -> stringResource(R.string.settings_backups_status_failed)
    "NOT_RUN" -> stringResource(R.string.settings_backups_verify_not_run)
    else -> humanizeKey(status)
}
