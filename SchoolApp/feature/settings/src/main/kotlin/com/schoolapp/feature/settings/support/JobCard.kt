package com.schoolapp.feature.settings.support

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.JobRun
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R

@Composable
internal fun JobCard(job: JobRun, canRetry: Boolean, retrying: Boolean, onRetry: () -> Unit, onOpen: () -> Unit) {
    val dash = stringResource(R.string.settings_dash)
    AppCard(onClick = onOpen, verticalSpacing = 2.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(humanizeKey(job.name.ifBlank { dash }), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                Text(humanizeKey(job.queue.ifBlank { dash }), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            JobStatusChip(job.status)
        }
        KeyValueRow(stringResource(R.string.settings_support_started), formatTimestamp(job.startedAt) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_finished), formatTimestamp(job.finishedAt) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_attempts), job.attempts?.toString() ?: dash)
        job.error?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
        if (canRetry) {
            AppTextButton(stringResource(R.string.settings_support_retry), onRetry, loading = retrying, leadingIcon = Icons.Outlined.Replay)
        }
    }
}

@Composable
internal fun JobStatusChip(status: String) {
    val (label, tone) = when (status) {
        "FAILED" -> R.string.settings_support_status_failed to StatusTone.Error
        "DONE" -> R.string.settings_support_status_done to StatusTone.Success
        "RUNNING" -> R.string.settings_support_status_running to StatusTone.Info
        "QUEUED" -> R.string.settings_support_status_queued to StatusTone.Info
        else -> null to StatusTone.Neutral
    }
    StatusChip(label?.let { stringResource(it) } ?: humanizeKey(status), tone)
}
