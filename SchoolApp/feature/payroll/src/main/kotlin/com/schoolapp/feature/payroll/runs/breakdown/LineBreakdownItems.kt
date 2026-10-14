package com.schoolapp.feature.payroll.runs.breakdown

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.core.model.payroll.PayslipLineItem
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.formatDays

internal data class LineItems(
    val earnings: List<PayslipLineItem>,
    val deductions: List<PayslipLineItem>,
    val totalEarnings: Long,
    val totalDeductions: Long,
)

/** The API's itemised breakdown; lines calculated before it existed are rebuilt from their totals. */
@Composable
internal fun lineBreakdownItems(line: PayrollLine): LineItems {
    val b = line.breakdown
    if (b.hasItems) return LineItems(b.earnings, b.deductionItems, b.totalEarningsMinor, b.totalDeductionsMinor)
    val earnings = buildList {
        add(PayslipLineItem(stringResource(R.string.payroll_basic), null, line.basicMinor))
        add(PayslipLineItem(stringResource(R.string.payroll_allowances), null, line.allowancesMinor))
        if (line.adjustmentsMinor > 0) add(PayslipLineItem(stringResource(R.string.payroll_adjustments), null, line.adjustmentsMinor))
    }
    val deductions = buildList {
        add(PayslipLineItem(stringResource(R.string.payroll_deductions), null, line.deductionsMinor))
        if (line.leaveDeductionMinor > 0) {
            add(
                PayslipLineItem(
                    stringResource(R.string.payroll_unpaid_leave),
                    stringResource(R.string.payroll_unpaid_days, formatDays(line.unpaidLeaveDays)),
                    line.leaveDeductionMinor,
                ),
            )
        }
        if (line.adjustmentsMinor < 0) add(PayslipLineItem(stringResource(R.string.payroll_adjustments), null, -line.adjustmentsMinor))
    }
    return LineItems(earnings, deductions, earnings.sumOf { it.amountMinor }, deductions.sumOf { it.amountMinor })
}
