package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FileDownload
import androidx.compose.material.icons.outlined.HowToReg
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.dashboard.AttendanceMonth
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.parent.attendanceChip
import com.schoolapp.feature.dashboard.parent.attendanceTone
import com.schoolapp.feature.dashboard.parent.percentText

/** Month attendance %, the day counts and today's status chip (unmarked stays "Not marked yet"). */
@Composable
internal fun AttendanceTile(month: AttendanceMonth?, today: AttendanceStatus?, onClick: (() -> Unit)?, modifier: Modifier = Modifier) {
    val chip = attendanceChip(today)
    StatCard(
        label = stringResource(R.string.dashboard_kpi_attendance),
        value = percentText(month?.percent) ?: stringResource(R.string.dashboard_kpi_no_value),
        icon = Icons.Outlined.HowToReg,
        tone = attendanceTone(month?.percent),
        supporting = if (month != null && month.percent != null) {
            stringResource(R.string.dashboard_kpi_attendance_counts, month.present, month.absent, month.late)
        } else {
            stringResource(R.string.dashboard_kpi_attendance_none)
        },
        onClick = onClick,
        modifier = modifier,
        footer = {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(R.string.dashboard_today_label), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                StatusChip(stringResource(chip.labelRes), chip.tone)
            }
        },
    )
}

/** Total due (overdue in error tone), next due date and "Download challan" for the next invoice. */
@Composable
internal fun FeeTile(fees: FeeSummary, onOpen: (() -> Unit)?, challan: ParentChallan, modifier: Modifier = Modifier) {
    val currency = fees.currency
    val next = fees.nextDue
    val supporting = when {
        fees.overdueMinor > 0 -> stringResource(R.string.dashboard_kpi_fee_overdue, MoneyFormat.format(fees.overdueMinor, currency))
        next != null -> formatDate(next.dueDate)?.let { stringResource(R.string.dashboard_kpi_fee_next_due, it) }
        fees.advanceMinor > 0 -> stringResource(R.string.dashboard_kpi_fee_advance, MoneyFormat.format(fees.advanceMinor, currency))
        else -> stringResource(R.string.dashboard_kpi_fee_clear)
    }
    StatCard(
        label = stringResource(R.string.dashboard_kpi_fee_due),
        value = MoneyFormat.format(fees.totalDueMinor, currency),
        icon = Icons.Outlined.Payments,
        tone = when {
            fees.overdueMinor > 0 -> StatusTone.Error
            fees.totalDueMinor > 0 -> StatusTone.Warning
            else -> StatusTone.Success
        },
        supporting = supporting,
        onClick = onOpen,
        modifier = modifier,
        footer = next?.let { challanFooter(it.invoiceId, challan, onOpen) },
    )
}

/** Download when the next invoice is known; otherwise "View challan" opens the fees screen (null without access). */
private fun challanFooter(invoiceId: String?, challan: ParentChallan, onOpen: (() -> Unit)?): (@Composable ColumnScope.() -> Unit)? = when {
    invoiceId != null -> {
        {
            AppTextButton(
                text = stringResource(R.string.dashboard_kpi_download_challan),
                onClick = { challan.onDownload(invoiceId) },
                loading = challan.state.isDownloading,
                leadingIcon = Icons.Outlined.FileDownload,
            )
        }
    }
    onOpen != null -> { { AppTextButton(stringResource(R.string.dashboard_kpi_challan), onOpen) } }
    else -> null
}
