package com.schoolapp.feature.fees.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R

/** Total due, overdue (error tone), advance credit, next due and last payment for one child. */
@Composable
internal fun FeeSummaryCard(summary: FeeSummary, modifier: Modifier = Modifier) {
    val currency = summary.currency
    AppCard(modifier = modifier) {
        Text(stringResource(R.string.fees_summary_title), style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            MoneyRow(stringResource(R.string.fees_total_due), summary.totalDueMinor, currency = currency, emphasized = true)
            MoneyRow(
                label = stringResource(R.string.fees_overdue),
                amountMinor = summary.overdueMinor,
                currency = currency,
                amountColor = if (summary.overdueMinor > 0) AppColors.Error else AppColors.TextPrimary,
            )
            if (summary.advanceMinor > 0) {
                MoneyRow(stringResource(R.string.fees_advance_credit), summary.advanceMinor, currency = currency, amountColor = AppColors.Success)
            }
        }
        val next = summary.nextDue
        val last = summary.lastPayment
        if (next != null || last != null) HorizontalDivider(color = AppColors.Border)
        next?.let {
            MoneyRow(
                label = stringResource(R.string.fees_next_due),
                amountMinor = it.amountMinor,
                currency = currency,
                supporting = listOfNotNull(
                    formatDate(it.dueDate)?.let { date -> stringResource(R.string.fees_due_on, date) },
                    it.invoiceNo,
                ).joinToString(" · ").ifBlank { null },
            )
        }
        last?.let {
            MoneyRow(
                label = stringResource(R.string.fees_last_payment),
                amountMinor = it.amountMinor,
                currency = currency,
                supporting = listOfNotNull(formatDate(it.paidOn), it.receiptNo).joinToString(" · ").ifBlank { null },
            )
        }
    }
}
