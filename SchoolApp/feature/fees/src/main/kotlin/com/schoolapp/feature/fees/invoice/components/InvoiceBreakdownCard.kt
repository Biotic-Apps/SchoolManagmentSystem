package com.schoolapp.feature.fees.invoice.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.classLabel
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.components.periodLabel
import com.schoolapp.feature.fees.components.tone

/** Invoice header (number, student, period, dates, status). */
@Composable
internal fun InvoiceHeaderCard(invoice: Invoice, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(invoice.invoiceNo, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                val student = listOfNotNull(
                    invoice.studentName.takeIf { it.isNotBlank() },
                    classLabel(invoice.className, invoice.sectionName),
                ).joinToString(" · ")
                if (student.isNotBlank()) Text(student, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                periodLabel(invoice.period)?.let {
                    Text(stringResource(R.string.fees_period, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                formatDate(invoice.issueDate)?.let {
                    Text(stringResource(R.string.fees_issued_on, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                formatDate(invoice.dueDate)?.let {
                    Text(stringResource(R.string.fees_due_on, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            StatusChip(invoice.status.label(), invoice.status.tone())
        }
    }
}

/** Fee lines, concession (negative), late fee, total, paid and the emphasized balance. */
@Composable
internal fun InvoiceBreakdownCard(invoice: Invoice, modifier: Modifier = Modifier) {
    val currency = invoice.currency
    AppCard(modifier = modifier) {
        Text(stringResource(R.string.fees_breakdown), style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
        Column {
            invoice.lines.forEach { line ->
                MoneyRow(
                    label = line.feeHeadName.ifBlank { stringResource(R.string.fees_fee) },
                    amountMinor = line.amountMinor,
                    currency = currency,
                    supporting = line.description,
                )
            }
            if (invoice.concessionMinor != 0L) {
                MoneyRow(
                    label = stringResource(R.string.fees_concession),
                    amountMinor = -kotlin.math.abs(invoice.concessionMinor),
                    currency = currency,
                    amountColor = AppColors.Success,
                )
            }
            if (invoice.lateFeeMinor != 0L) {
                MoneyRow(stringResource(R.string.fees_late_fee), invoice.lateFeeMinor, currency = currency, amountColor = AppColors.Error)
            }
        }
        HorizontalDivider(color = AppColors.Border)
        Column {
            MoneyRow(stringResource(R.string.fees_total), invoice.totalMinor, currency = currency)
            MoneyRow(stringResource(R.string.fees_paid), invoice.paidMinor, currency = currency, amountColor = AppColors.Success)
            MoneyRow(
                label = stringResource(R.string.fees_balance),
                amountMinor = invoice.balanceMinor,
                currency = currency,
                emphasized = true,
                amountColor = if (invoice.balanceMinor > 0) AppColors.TextPrimary else AppColors.Success,
            )
        }
    }
}
