package com.schoolapp.feature.accounts.profitloss

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.accounts.ProfitLoss
import com.schoolapp.core.model.accounts.ProfitLossLine
import com.schoolapp.feature.accounts.R
import kotlin.math.roundToInt

/** Share of income and expenses in the period's total flow, as two bars. */
@Composable
internal fun IncomeExpenseBar(report: ProfitLoss) {
    val income = report.totalIncomeMinor.coerceAtLeast(0)
    val expenses = report.totalExpensesMinor.coerceAtLeast(0)
    val flow = income + expenses
    AppCard(verticalSpacing = 8.dp) {
        Text(stringResource(R.string.accounts_income_vs_expenses), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        ProgressRow(
            title = stringResource(R.string.accounts_section_income),
            percent = percentOf(income, flow),
            supporting = MoneyFormat.format(income),
            tone = StatusTone.Success,
        )
        ProgressRow(
            title = stringResource(R.string.accounts_section_expenses),
            percent = percentOf(expenses, flow),
            supporting = MoneyFormat.format(expenses),
            tone = StatusTone.Error,
        )
        if (income > 0) {
            Text(
                stringResource(R.string.accounts_expense_ratio, percentOf(expenses, income)),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
    }
}

/** Income and expense lines with their totals; side by side on wide screens (web two-column layout). */
@Composable
internal fun ProfitLossSections(report: ProfitLoss) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val income = @Composable { m: Modifier ->
            LinesCard(stringResource(R.string.accounts_section_income), report.incomeLines, report.totalIncomeMinor, m)
        }
        val expenses = @Composable { m: Modifier ->
            LinesCard(stringResource(R.string.accounts_section_expenses), report.expenseLines, report.totalExpensesMinor, m)
        }
        if (maxWidth >= WIDE) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
                income(Modifier.weight(1f))
                expenses(Modifier.weight(1f))
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                income(Modifier.fillMaxWidth())
                expenses(Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun LinesCard(title: String, lines: List<ProfitLossLine>, totalMinor: Long, modifier: Modifier) {
    AppCard(modifier = modifier) {
        Text(title.uppercase(), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
        if (lines.isEmpty()) {
            Text(
                stringResource(R.string.accounts_no_lines),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        lines.forEachIndexed { index, line ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            MoneyRow(label = line.item, amountMinor = line.amountMinor)
        }
        HorizontalDivider(color = AppColors.Border)
        MoneyRow(label = stringResource(R.string.accounts_total), amountMinor = totalMinor, emphasized = true)
    }
}

private fun percentOf(part: Long, whole: Long): Int =
    if (whole <= 0) 0 else ((part.toDouble() / whole) * PERCENT).roundToInt().coerceIn(0, MAX_PERCENT)

private const val PERCENT = 100
private const val MAX_PERCENT = 999
private val WIDE = 600.dp
