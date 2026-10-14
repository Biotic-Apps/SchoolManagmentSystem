package com.schoolapp.feature.payroll.setup.detail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.setup.SalaryStructure
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.setup.yearMonthLabel

/** Basic, every allowance and deduction, gross and net, the overtime rate and the month it starts. */
@Composable
internal fun StructureSummaryCard(structure: SalaryStructure, title: String, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = title, subtitle = stringResource(R.string.payroll_setup_effective_from, yearMonthLabel(structure.effectiveFrom)))
        MoneyRow(stringResource(R.string.payroll_setup_basic), structure.basicMinor)
        if (structure.allowances.isNotEmpty()) {
            GroupLabel(stringResource(R.string.payroll_setup_allowances))
            structure.allowances.forEach { MoneyRow(it.name, it.amountMinor) }
        }
        if (structure.deductions.isNotEmpty()) {
            GroupLabel(stringResource(R.string.payroll_setup_deductions))
            structure.deductions.forEach { MoneyRow(it.name, -it.amountMinor, amountColor = AppColors.Error) }
        }
        HorizontalDivider(color = AppColors.Border)
        MoneyRow(stringResource(R.string.payroll_setup_gross), structure.grossMinor, emphasized = true)
        MoneyRow(stringResource(R.string.payroll_setup_net), structure.netMinor, emphasized = true)
        KeyValueRow(
            stringResource(R.string.payroll_setup_overtime_rate),
            structure.overtimeRateMinor?.let { MoneyFormat.format(it) } ?: stringResource(R.string.payroll_setup_overtime_rule),
        )
        structure.reason?.let {
            Text(stringResource(R.string.payroll_setup_reason_value, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

@Composable
private fun GroupLabel(text: String) {
    Text(text, style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
}
