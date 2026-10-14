package com.schoolapp.feature.students.transfers

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Block
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.transfers.Transfer
import com.schoolapp.core.model.transfers.TransferStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/** One transfer: student, route, effective date, reason, status; open incoming ones can be accepted or rejected, outgoing ones cancelled. */
@Composable
internal fun TransferRow(
    transfer: Transfer,
    incoming: Boolean,
    canDecide: Boolean,
    onAccept: () -> Unit,
    onReject: () -> Unit,
    onCancel: () -> Unit,
) {
    Column {
        ListItemRow(
            title = transfer.studentName,
            supporting = listOfNotNull(
                transfer.admissionNo,
                "${transfer.fromBranchName.orEmpty()} → ${transfer.toBranchName.orEmpty()}",
                formatDate(transfer.effectiveDate)?.let { stringResource(R.string.students_effective_on, it) },
            ).joinToString(" · "),
            leadingIcon = Icons.Outlined.SwapHoriz,
            trailing = { StatusChip(humanizeKey(transfer.status.name), statusTone(transfer.status)) },
        )
        val notes = listOfNotNull(
            transfer.reason?.let { stringResource(R.string.students_transfer_reason, it) },
            transfer.decisionReason?.let { stringResource(R.string.students_transfer_decision, it) },
            formatTimestamp(transfer.createdAt)?.let { stringResource(R.string.students_requested_on, it) },
        )
        if (notes.isNotEmpty()) {
            Text(
                notes.joinToString("\n"),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
            )
        }
        if (canDecide && transfer.status == TransferStatus.REQUESTED) {
            Row(
                Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (incoming) {
                    SecondaryButton(stringResource(R.string.students_reject), onReject, Modifier.weight(1f), leadingIcon = Icons.Outlined.Close)
                    PrimaryButton(stringResource(R.string.students_accept), onAccept, Modifier.weight(1f), leadingIcon = Icons.Outlined.Check)
                } else {
                    SecondaryButton(stringResource(R.string.students_cancel_transfer), onCancel, Modifier.weight(1f), leadingIcon = Icons.Outlined.Block)
                }
            }
        }
    }
}

private fun statusTone(status: TransferStatus) = when (status) {
    TransferStatus.REQUESTED -> StatusTone.Warning
    TransferStatus.ACCEPTED -> StatusTone.Success
    TransferStatus.REJECTED, TransferStatus.CANCELLED -> StatusTone.Error
    TransferStatus.UNKNOWN -> StatusTone.Neutral
}
