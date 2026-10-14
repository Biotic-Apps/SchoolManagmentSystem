package com.schoolapp.feature.settings.support

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.JobRun
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R

/** Full detail of one job, including the complete error text. */
@Composable
internal fun JobDetailSheet(job: JobRun, canRetry: Boolean, retrying: Boolean, onRetry: () -> Unit, onDismiss: () -> Unit) {
    val dash = stringResource(R.string.settings_dash)
    AppBottomSheet(title = humanizeKey(job.name.ifBlank { dash }), onDismiss = onDismiss) {
        Text(
            stringResource(R.string.settings_support_queue_name, humanizeKey(job.queue.ifBlank { dash })),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        JobStatusChip(job.status)
        KeyValueRow(stringResource(R.string.settings_support_attempts), job.attempts?.toString() ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_started), formatTimestamp(job.startedAt) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_finished), formatTimestamp(job.finishedAt) ?: dash)
        KeyValueRow(stringResource(R.string.settings_support_job_id), job.id)
        Text(stringResource(R.string.settings_support_error), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
        Text(
            text = job.error ?: stringResource(R.string.settings_support_no_error),
            style = MaterialTheme.typography.bodySmall,
            fontFamily = FontFamily.Monospace,
            color = AppColors.TextPrimary,
            modifier = Modifier.fillMaxWidth().background(AppColors.Selected, RoundedCornerShape(8.dp)).padding(12.dp),
        )
        if (canRetry) {
            PrimaryButton(
                text = stringResource(R.string.settings_support_retry_job),
                onClick = onRetry,
                loading = retrying,
                leadingIcon = Icons.Outlined.Replay,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
