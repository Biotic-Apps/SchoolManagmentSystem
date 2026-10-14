package com.schoolapp.feature.attendance.qr

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.QrCode2
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.QrScanLog
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.toneColors

/** Today's scans in one card, newest first, each with its outcome icon and 12-hour time. */
@Composable
internal fun QrRecentScans(state: QrScanUiState, modifier: Modifier = Modifier) {
    when {
        state.logsLoading && state.logs.isEmpty() -> LoadingState(modifier, rows = 2)
        state.logs.isEmpty() -> EmptyState(
            title = stringResource(R.string.qr_recent_empty),
            message = stringResource(R.string.qr_recent_empty_message),
            icon = Icons.Outlined.QrCode2,
            modifier = modifier,
        )
        else -> AppCard(modifier, contentPadding = 0.dp) {
            state.logs.forEachIndexed { index, log ->
                if (index > 0) HorizontalDivider(color = AppColors.Border)
                LogRow(log)
            }
        }
    }
}

@Composable
private fun LogRow(log: QrScanLog) {
    Row(
        Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Icon(log.outcome.icon(), contentDescription = null, tint = log.outcome.tone().toneColors().content, modifier = Modifier.size(20.dp))
        Column(Modifier.weight(1f)) {
            Text(
                log.name ?: stringResource(R.string.qr_unknown),
                style = MaterialTheme.typography.bodyLarge,
                color = AppColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                listOfNotNull(qrPersonLabel(log.personType), qrOutcomeLabel(log.outcome)).joinToString(" · "),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        scanTime(log.scannedAt)?.let { Text(it, style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary) }
    }
}
