package com.schoolapp.feature.payroll.overtime

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.extras.OvertimeEntry
import com.schoolapp.core.model.payroll.extras.OvertimeSource
import com.schoolapp.core.model.payroll.extras.OvertimeStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.designationLabel
import com.schoolapp.feature.payroll.components.formatHours

/** Permissions and month lock deciding which row actions show. */
internal data class OvertimeRowRules(val canApprove: Boolean, val canEdit: Boolean, val locked: Boolean)

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun OvertimeRow(
    entry: OvertimeEntry,
    rules: OvertimeRowRules,
    busy: Boolean,
    onDecide: (Boolean) -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 6.dp) {
        SectionHeader(
            title = entry.staffName,
            subtitle = listOfNotNull(designationLabel(entry.designation), formatDate(entry.date)).joinToString(" · "),
            action = { StatusChip(statusLabel(entry.status), statusTone(entry.status)) },
        )
        Text(formatHours(entry.minutes), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        val source = if (entry.source == OvertimeSource.ATTENDANCE) {
            stringResource(R.string.payroll_ot_from_attendance, formatTime(entry.checkOut) ?: "?")
        } else {
            stringResource(R.string.payroll_ot_by_hand)
        }
        Text(
            listOfNotNull(source, entry.reason, entry.decidedBy?.let { stringResource(R.string.payroll_ot_by, it) }).joinToString(" · "),
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
        )
        val canDecide = rules.canApprove && !rules.locked
        val canRemove = rules.canEdit && !rules.locked && entry.source == OvertimeSource.MANUAL && entry.status == OvertimeStatus.PENDING
        if (canDecide || canRemove) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (canDecide && entry.status != OvertimeStatus.APPROVED) {
                    AppTextButton(stringResource(R.string.payroll_ot_approve), { onDecide(true) }, enabled = !busy, leadingIcon = Icons.Outlined.Check)
                }
                if (canDecide && entry.status != OvertimeStatus.REJECTED) {
                    AppTextButton(
                        stringResource(R.string.payroll_ot_reject), { onDecide(false) },
                        enabled = !busy, leadingIcon = Icons.Outlined.Close, contentColor = AppColors.Error,
                    )
                }
                if (canRemove) {
                    AppTextButton(
                        stringResource(R.string.payroll_ot_remove), onRemove,
                        enabled = !busy, leadingIcon = Icons.Outlined.Delete, contentColor = AppColors.Error,
                    )
                }
            }
        }
    }
}

@Composable
private fun statusLabel(status: OvertimeStatus): String = stringResource(
    when (status) {
        OvertimeStatus.PENDING -> R.string.payroll_ot_status_pending
        OvertimeStatus.APPROVED -> R.string.payroll_ot_status_approved
        OvertimeStatus.REJECTED -> R.string.payroll_ot_status_rejected
    },
)

private fun statusTone(status: OvertimeStatus): StatusTone = when (status) {
    OvertimeStatus.PENDING -> StatusTone.Warning
    OvertimeStatus.APPROVED -> StatusTone.Success
    OvertimeStatus.REJECTED -> StatusTone.Error
}
