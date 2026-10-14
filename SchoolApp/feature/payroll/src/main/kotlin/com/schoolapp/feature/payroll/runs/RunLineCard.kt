package com.schoolapp.feature.payroll.runs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.designationLabel
import com.schoolapp.feature.payroll.components.formatDays
import com.schoolapp.feature.payroll.components.formatHours
import com.schoolapp.feature.payroll.components.payrollStatusLabel
import com.schoolapp.feature.payroll.components.payrollTone

/** One staff line: gross, overtime, earnings, deductions, net and what is left to pay; tap for the breakdown. */
@Composable
internal fun RunLineCard(
    line: PayrollLine,
    currency: String,
    canPay: Boolean,
    onBreakdown: () -> Unit,
    onPay: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), onClick = onBreakdown) {
        SectionHeader(
            title = line.name,
            subtitle = listOfNotNull(designationLabel(line.designation), line.employeeNo).joinToString(" · ").ifEmpty { null },
            action = line.status?.let { status -> { StatusChip(payrollStatusLabel(status), payrollTone(status)) } },
        )
        MoneyRow(stringResource(R.string.payroll_gross), line.gross, currency = currency)
        val overtime = line.breakdown.overtimeMinor
        if (overtime > 0) {
            MoneyRow(
                stringResource(R.string.payroll_overtime), overtime, currency = currency,
                supporting = formatHours(line.breakdown.overtimeMinutes).takeIf { line.breakdown.overtimeMinutes > 0 },
            )
        }
        MoneyRow(stringResource(R.string.payroll_total_earnings), line.totalEarnings, currency = currency)
        val deductions = line.totalDeductions
        MoneyRow(
            stringResource(R.string.payroll_deductions), -deductions, currency = currency,
            supporting = line.unpaidLeaveDays.takeIf { it > 0 }?.let { stringResource(R.string.payroll_unpaid_days, formatDays(it)) },
            amountColor = if (deductions > 0) AppColors.Error else AppColors.TextPrimary,
        )
        MoneyRow(stringResource(R.string.payroll_net), line.netMinor, currency = currency, emphasized = true)
        MoneyRow(
            stringResource(R.string.payroll_to_pay), line.balanceMinor, currency = currency,
            amountColor = if (line.balanceMinor > 0) AppColors.Warning else AppColors.TextPrimary,
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End), verticalAlignment = Alignment.CenterVertically) {
            AppTextButton(stringResource(R.string.payroll_view_breakdown), onBreakdown)
            if (canPay) {
                SecondaryButton(
                    stringResource(R.string.payroll_record_payment), onPay, leadingIcon = Icons.Outlined.AccountBalanceWallet,
                )
            }
        }
    }
}
