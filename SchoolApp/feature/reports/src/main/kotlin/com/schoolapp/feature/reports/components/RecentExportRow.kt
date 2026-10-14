package com.schoolapp.feature.reports.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.reports.RecentExport
import com.schoolapp.core.model.reports.ReportJobState
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.reports.R

internal data class RecentExportActions(
    val onDownload: (RecentExport) -> Unit,
    val onRetry: (RecentExport) -> Unit,
    val onCheckAgain: (RecentExport) -> Unit,
    val onRemove: (RecentExport) -> Unit,
)

/** Title, format and start time; status chip; Download when ready, Try again when failed. */
@Composable
internal fun RecentExportRow(export: RecentExport, retrying: Boolean, actions: RecentExportActions, modifier: Modifier = Modifier) {
    val state = export.status.state
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(export.title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                val started = formatTimestamp(export.startedAt).orEmpty()
                Text(
                    stringResource(R.string.reports_recent_meta, export.request.format.name, started),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
            }
            if (!state.isFinished && !export.pollFailed) {
                CircularProgressIndicator(Modifier.size(16.dp), color = AppColors.Primary, strokeWidth = 2.dp)
            }
            StatusChip(jobStateLabel(state), jobStateTone(state))
        }
        StatusLine(export)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            when {
                state == ReportJobState.DONE && export.status.fileUrl != null -> AppTextButton(
                    stringResource(R.string.reports_download),
                    onClick = { actions.onDownload(export) },
                    leadingIcon = Icons.Outlined.Download,
                )
                state == ReportJobState.FAILED -> AppTextButton(
                    stringResource(R.string.reports_retry_export),
                    onClick = { actions.onRetry(export) },
                    loading = retrying,
                    leadingIcon = Icons.Outlined.Refresh,
                )
                export.pollFailed -> AppTextButton(
                    stringResource(R.string.reports_check_again),
                    onClick = { actions.onCheckAgain(export) },
                    leadingIcon = Icons.Outlined.Refresh,
                )
            }
            if (state.isFinished || export.pollFailed) {
                AppTextButton(
                    stringResource(R.string.reports_remove),
                    onClick = { actions.onRemove(export) },
                    contentColor = AppColors.TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun StatusLine(export: RecentExport) {
    val status = export.status
    val text = when {
        export.pollFailed -> stringResource(R.string.reports_poll_failed)
        status.state == ReportJobState.FAILED -> status.error ?: stringResource(R.string.reports_job_failed)
        status.state == ReportJobState.DONE -> status.rowCount?.let { stringResource(R.string.reports_recent_rows, it) }
        else -> null
    } ?: return
    val isError = export.pollFailed || status.state == ReportJobState.FAILED
    Text(
        text,
        style = MaterialTheme.typography.bodySmall,
        color = if (isError) AppColors.Error else AppColors.TextSecondary,
    )
}
