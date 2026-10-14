package com.schoolapp.feature.students.detail.idcard

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.students.R

/** Latest ID card: status, version, generated time, Download and (with `students.edit`) Generate / Reprint. */
@Composable
internal fun IdCardCard(
    state: StudentIdCardUiState,
    canGenerate: Boolean,
    onDownload: () -> Unit,
    onGenerate: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val card = state.card
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(title = stringResource(R.string.sd_idcard_title), action = card?.let { { StatusChipFor(it.status) } })
        if (card == null) {
            Text(
                stringResource(if (canGenerate) R.string.sd_idcard_empty_can_generate else R.string.sd_idcard_empty_view_only),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        } else {
            KeyValueRow(stringResource(R.string.sd_idcard_version), card.version.toString())
            KeyValueRow(stringResource(R.string.sd_idcard_generated), formatTimestamp(card.generatedAt))
        }
        if (state.isPending) InlineMessage(stringResource(R.string.sd_idcard_rendering), StatusTone.Info)
        if (state.isFailed) InlineMessage(stringResource(R.string.sd_idcard_failed), StatusTone.Error)
        state.actionError?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        if (state.isReady) {
            PrimaryButton(
                stringResource(R.string.sd_idcard_download),
                onDownload,
                Modifier.fillMaxWidth(),
                loading = state.isOpening,
                leadingIcon = Icons.Outlined.Download,
            )
        }
        if (canGenerate && !state.isPending) {
            val label = when {
                card == null -> R.string.sd_idcard_generate
                state.isFailed -> R.string.sd_idcard_try_again
                else -> R.string.sd_idcard_reprint
            }
            SecondaryButton(stringResource(label), onGenerate, Modifier.fillMaxWidth(), loading = state.isGenerating, leadingIcon = Icons.Outlined.Refresh)
        }
    }
}

@Composable
private fun StatusChipFor(status: IdCardStatus) {
    val (label, tone) = when (status) {
        IdCardStatus.PENDING -> R.string.sd_idcard_status_pending to StatusTone.Warning
        IdCardStatus.READY -> R.string.sd_idcard_status_ready to StatusTone.Success
        IdCardStatus.FAILED -> R.string.sd_idcard_status_failed to StatusTone.Error
        IdCardStatus.UNKNOWN -> R.string.sd_idcard_status_unknown to StatusTone.Neutral
    }
    Row(verticalAlignment = Alignment.CenterVertically) { StatusChip(stringResource(label), tone) }
}
