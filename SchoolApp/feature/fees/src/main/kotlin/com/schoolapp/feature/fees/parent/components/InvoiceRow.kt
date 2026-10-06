package com.schoolapp.feature.fees.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.components.periodLabel
import com.schoolapp.feature.fees.components.tone

/** Invoice number, period, due date and status on the left; balance right aligned. */
@Composable
internal fun InvoiceRow(invoice: Invoice, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(periodLabel(invoice.period) ?: invoice.invoiceNo, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(invoice.invoiceNo, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                formatDate(invoice.dueDate)?.let {
                    Text(stringResource(R.string.fees_due_on, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                StatusChip(invoice.status.label(), invoice.status.tone())
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(stringResource(R.string.fees_balance), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                MoneyText(
                    amountMinor = invoice.balanceMinor,
                    currency = invoice.currency,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (invoice.balanceMinor > 0) AppColors.TextPrimary else AppColors.Success,
                )
                Text(stringResource(R.string.fees_of_total), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                MoneyText(invoice.totalMinor, currency = invoice.currency, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
}
