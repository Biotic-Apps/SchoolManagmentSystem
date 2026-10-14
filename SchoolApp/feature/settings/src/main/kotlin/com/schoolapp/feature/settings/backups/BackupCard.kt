package com.schoolapp.feature.settings.backups

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Checklist
import androidx.compose.material.icons.outlined.VerifiedUser
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.BackupRun
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.settings.R

/** One backup run: when, how long, size, checksum, encryption, restore check and its actions. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun BackupCard(
    run: BackupRun,
    verifying: Boolean,
    downloading: Boolean,
    onVerify: () -> Unit,
    onDownload: () -> Unit,
    onViewChecks: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dash = stringResource(R.string.settings_dash)
    AppCard(modifier = modifier, verticalSpacing = 4.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = formatTimestamp(run.startedAt) ?: dash,
                style = MaterialTheme.typography.titleMedium,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(backupStatusLabel(run.status), backupStatusTone(run.status))
        }
        KeyValueRow(stringResource(R.string.settings_backups_duration), formatDuration(run.startedAt, run.finishedAt) ?: dash)
        KeyValueRow(stringResource(R.string.settings_backups_size), formatBytes(run.sizeBytes) ?: dash)
        KeyValueRow(
            stringResource(R.string.settings_backups_encrypted),
            stringResource(if (run.encrypted) R.string.settings_backups_yes else R.string.settings_backups_no),
        )
        ChecksumRow(run.checksumSha256)
        RestoreCheckRow(run)
        run.error?.takeIf { run.status == STATUS_FAILED }?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            if (run.canVerify) {
                AppTextButton(
                    text = stringResource(R.string.settings_backups_verify),
                    onClick = onVerify,
                    loading = verifying,
                    leadingIcon = Icons.Outlined.VerifiedUser,
                )
            }
            if (run.isDone) {
                AppTextButton(
                    text = stringResource(R.string.settings_backups_download),
                    onClick = onDownload,
                    loading = downloading,
                    leadingIcon = Icons.Outlined.Download,
                )
            }
            if (run.verify.checks.isNotEmpty()) {
                AppTextButton(
                    text = stringResource(R.string.settings_backups_view_checks),
                    onClick = onViewChecks,
                    leadingIcon = Icons.Outlined.Checklist,
                )
            }
        }
    }
}

@Composable
private fun RestoreCheckRow(run: BackupRun) {
    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = stringResource(R.string.settings_backups_restore_check),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = Modifier.weight(1f),
        )
        StatusChip(verifyStatusLabel(run.verify.status), verifyStatusTone(run.verify.status))
    }
    formatTimestamp(run.verify.at)?.let {
        Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary, modifier = Modifier.fillMaxWidth())
    }
}


private const val STATUS_FAILED = "FAILED"
