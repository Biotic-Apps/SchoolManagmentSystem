package com.schoolapp.feature.staff.idcard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import com.schoolapp.core.model.staff.idcard.StaffIdCard
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.staff.R

/** Status, version and generated time of the latest card, plus Download / Reprint. */
@Composable
internal fun IdCardDetails(
    card: StaffIdCard,
    state: StaffIdCardUiState,
    canGenerate: Boolean,
    onDownload: () -> Unit,
    onGenerate: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        AppCard(Modifier.fillMaxWidth()) {
            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    stringResource(R.string.staff_idcard_status),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                IdCardStatusChip(card.status)
            }
            KeyValueRow(stringResource(R.string.staff_idcard_version), card.version.toString())
            KeyValueRow(stringResource(R.string.staff_idcard_generated), formatTimestamp(card.generatedAt))
        }
        if (state.isPending) InlineMessage(stringResource(R.string.staff_idcard_rendering), StatusTone.Info)
        if (state.isFailed) InlineMessage(stringResource(R.string.staff_idcard_failed), StatusTone.Error)
        if (state.isReady) {
            PrimaryButton(
                text = stringResource(R.string.staff_idcard_download),
                onClick = onDownload,
                modifier = Modifier.fillMaxWidth(),
                loading = state.isOpening,
                leadingIcon = Icons.Outlined.Download,
            )
        }
        if (canGenerate && !state.isPending) {
            SecondaryButton(
                text = stringResource(if (state.isFailed) R.string.staff_idcard_try_again else R.string.staff_idcard_reprint),
                onClick = onGenerate,
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = Icons.Outlined.Refresh,
            )
        }
    }
}

@Composable
private fun IdCardStatusChip(status: IdCardStatus) {
    val (label, tone) = when (status) {
        IdCardStatus.PENDING -> R.string.staff_idcard_status_pending to StatusTone.Warning
        IdCardStatus.READY -> R.string.staff_idcard_status_ready to StatusTone.Success
        IdCardStatus.FAILED -> R.string.staff_idcard_status_failed to StatusTone.Error
        IdCardStatus.UNKNOWN -> R.string.staff_idcard_status_unknown to StatusTone.Neutral
    }
    StatusChip(stringResource(label), tone)
}
