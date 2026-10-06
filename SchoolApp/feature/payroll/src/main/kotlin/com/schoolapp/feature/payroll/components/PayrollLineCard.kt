package com.schoolapp.feature.payroll.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayrollLine
import com.schoolapp.feature.payroll.R

/** A staff member's line in a run: name, designation, unpaid leave, then net / paid / balance. */
@Composable
internal fun PayrollLineCard(line: PayrollLine, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        Text(line.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        val supporting = listOfNotNull(
            line.designation,
            line.unpaidLeaveDays.takeIf { it > 0 }?.let { stringResource(R.string.payroll_unpaid_leave_value, formatDays(it)) },
        )
        if (supporting.isNotEmpty()) {
            Text(supporting.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        MoneyRow(stringResource(R.string.payroll_net), line.netMinor, emphasized = true)
        MoneyRow(stringResource(R.string.payroll_paid), line.paidMinor)
        MoneyRow(
            stringResource(R.string.payroll_balance), line.balanceMinor,
            amountColor = if (line.balanceMinor > 0) AppColors.Warning else AppColors.TextPrimary,
        )
    }
}
