package com.schoolapp.feature.settings.backups

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.BackupCheck
import com.schoolapp.core.model.settings.BackupRun
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.settings.R

/** Restore check results: each check's expected vs actual value. */
@Composable
internal fun BackupChecksSheet(run: BackupRun, onDismiss: () -> Unit) {
    val dash = stringResource(R.string.settings_dash)
    AppBottomSheet(title = stringResource(R.string.settings_backups_checks_title), onDismiss = onDismiss) {
        Text(
            text = stringResource(R.string.settings_backups_checks_started, formatTimestamp(run.startedAt) ?: dash),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            StatusChip(verifyStatusLabel(run.verify.status), verifyStatusTone(run.verify.status))
            formatTimestamp(run.verify.at)?.let {
                Text(
                    text = "  " + stringResource(R.string.settings_backups_checked_at, it),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
        }
        run.verify.error?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
        if (run.verify.checks.isEmpty()) {
            EmptyState(
                title = stringResource(R.string.settings_backups_checks_empty),
                message = stringResource(R.string.settings_backups_checks_empty_message),
            )
        }
        run.verify.checks.forEach { CheckCard(it, dash) }
    }
}

@Composable
private fun CheckCard(check: BackupCheck, dash: String) {
    AppCard(verticalSpacing = 0.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = check.name,
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(
                text = stringResource(if (check.ok) R.string.settings_backups_check_ok else R.string.settings_backups_status_failed),
                tone = if (check.ok) StatusTone.Success else StatusTone.Error,
            )
        }
        Column(verticalArrangement = Arrangement.spacedBy(0.dp)) {
            KeyValueRow(stringResource(R.string.settings_backups_expected), formatCheckValue(check.expected, check.numeric) ?: dash)
            KeyValueRow(stringResource(R.string.settings_backups_actual), formatCheckValue(check.actual, check.numeric) ?: dash)
        }
    }
}
