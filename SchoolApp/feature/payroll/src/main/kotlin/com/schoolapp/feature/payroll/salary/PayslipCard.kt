package com.schoolapp.feature.payroll.salary

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.Payslip
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.designationLabel
import com.schoolapp.feature.payroll.components.formatDays
import com.schoolapp.feature.payroll.components.monthLabel
import com.schoolapp.feature.payroll.components.payrollStatusLabel
import com.schoolapp.feature.payroll.components.payrollTone

/**
 * Header, month attendance, itemised earnings and deductions (red, negative) with notes, then net / paid / balance.
 * Older runs without a breakdown fall back to basic, allowances, deductions, leave and adjustments.
 */
@Composable
internal fun PayslipCard(payslip: Payslip, onDownload: (String) -> Unit, modifier: Modifier = Modifier) {
    val currency = payslip.currency
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = payslip.staffName,
            subtitle = listOfNotNull(
                designationLabel(payslip.designation),
                stringResource(R.string.payroll_payslip_title, monthLabel(payslip.month)),
            ).joinToString(" · "),
            action = payslip.status?.let { status -> { StatusChip(payrollStatusLabel(status), payrollTone(status)) } },
        )
        payslip.attendance?.let { PayAttendanceStrip(it, payslip.overtimeMinutes) }
        if (payslip.breakdown.hasItems) {
            PayBreakdownSection(
                title = stringResource(R.string.payroll_earnings), items = payslip.earnings,
                totalLabel = stringResource(R.string.payroll_total_earnings), totalMinor = payslip.totalEarningsMinor,
                currency = currency, negative = false,
            )
            PayBreakdownSection(
                title = stringResource(R.string.payroll_deductions), items = payslip.deductionItems,
                totalLabel = stringResource(R.string.payroll_total_deductions), totalMinor = payslip.totalDeductionsMinor,
                currency = currency, negative = true,
            )
        } else {
            LegacyItems(payslip)
        }
        HorizontalDivider(color = AppColors.Border)
        MoneyRow(stringResource(R.string.payroll_net), payslip.netMinor, currency = currency, emphasized = true)
        MoneyRow(stringResource(R.string.payroll_paid), payslip.paidMinor, currency = currency)
        MoneyRow(
            stringResource(R.string.payroll_balance), payslip.balanceMinor, currency = currency,
            amountColor = if (payslip.balanceMinor > 0) AppColors.Warning else AppColors.TextPrimary,
        )
        val pdfUrl = payslip.pdfUrl
        if (pdfUrl != null) {
            SecondaryButton(
                text = stringResource(R.string.payroll_download_payslip),
                onClick = { onDownload(pdfUrl) },
                leadingIcon = Icons.Outlined.Download,
            )
        }
    }
}

@Composable
private fun LegacyItems(payslip: Payslip) {
    val currency = payslip.currency
    MoneyRow(stringResource(R.string.payroll_basic), payslip.basicMinor, currency = currency)
    if (payslip.allowances.isNotEmpty()) {
        GroupLabel(stringResource(R.string.payroll_allowances))
        payslip.allowances.forEach { MoneyRow(it.name, it.amountMinor, currency = currency) }
    }
    if (payslip.deductions.isNotEmpty()) {
        GroupLabel(stringResource(R.string.payroll_deductions))
        payslip.deductions.forEach { MoneyRow(it.name, -it.amountMinor, currency = currency, amountColor = AppColors.Error) }
    }
    KeyValueRow(stringResource(R.string.payroll_unpaid_leave_days), formatDays(payslip.unpaidLeaveDays))
    if (payslip.leaveDeductionMinor != 0L) {
        MoneyRow(
            stringResource(R.string.payroll_leave_deduction), -payslip.leaveDeductionMinor,
            currency = currency, amountColor = AppColors.Error,
        )
    }
    if (payslip.adjustmentsMinor != 0L) {
        MoneyRow(
            stringResource(R.string.payroll_adjustments), payslip.adjustmentsMinor, currency = currency,
            amountColor = if (payslip.adjustmentsMinor < 0) AppColors.Error else AppColors.TextPrimary,
        )
    }
}

@Composable
private fun GroupLabel(text: String) {
    Text(text, style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
}
