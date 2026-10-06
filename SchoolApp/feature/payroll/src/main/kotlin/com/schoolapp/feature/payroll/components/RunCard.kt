package com.schoolapp.feature.payroll.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayrollRun
import com.schoolapp.feature.payroll.R

/** One month's run: status, staff count, net / paid / balance; [footer] holds the approval action or banner. */
@Composable
internal fun RunCard(
    run: PayrollRun,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    footer: (@Composable () -> Unit)? = null,
) {
    AppCard(modifier.fillMaxWidth(), onClick = onClick) {
        SectionHeader(
            title = monthLabel(run.month),
            subtitle = listOfNotNull(run.branchName, stringResource(R.string.payroll_staff_count, run.staffCount)).joinToString(" · "),
            action = { StatusChip(payrollStatusLabel(run.status.name), payrollTone(run.status.name)) },
        )
        RunTotals(run)
        footer?.invoke()
    }
}

/** Net total, paid and balance rows with right-aligned amounts. */
@Composable
internal fun RunTotals(run: PayrollRun) {
    MoneyRow(stringResource(R.string.payroll_net_total), run.netMinor, emphasized = true)
    MoneyRow(stringResource(R.string.payroll_paid), run.paidMinor)
    MoneyRow(
        stringResource(R.string.payroll_balance), run.balanceMinor,
        amountColor = if (run.balanceMinor > 0) AppColors.Warning else AppColors.TextPrimary,
    )
}
