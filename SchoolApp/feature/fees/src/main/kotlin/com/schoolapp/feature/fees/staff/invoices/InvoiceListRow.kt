package com.schoolapp.feature.fees.staff.invoices

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.classLabel
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.components.periodLabel
import com.schoolapp.feature.fees.components.tone

/** Invoice no., student and class, month, due date, totals and status; a checkbox while selecting drafts. */
@Composable
internal fun InvoiceListRow(invoice: Invoice, selected: Boolean?, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onClick, contentPadding = 12.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            if (selected != null) {
                Checkbox(checked = selected, onCheckedChange = null, colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary))
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(invoice.studentName, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                Text(
                    listOfNotNull(invoice.invoiceNo, classLabel(invoice.className, invoice.sectionName), periodLabel(invoice.period))
                        .filter { it.isNotBlank() }.joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                Text(
                    stringResource(
                        R.string.fees_inv_total_paid,
                        MoneyFormat.format(invoice.totalMinor, invoice.currency),
                        MoneyFormat.format(invoice.paidMinor, invoice.currency),
                    ),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                invoice.dueDate?.let {
                    Text(stringResource(R.string.fees_inv_due, formatDate(it).orEmpty()), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                StatusChip(invoice.status.label(), invoice.status.tone())
                Text(
                    MoneyFormat.format(invoice.balanceMinor, invoice.currency),
                    style = MaterialTheme.typography.titleMedium,
                    color = if (invoice.balanceMinor > 0) AppColors.TextPrimary else AppColors.TextSecondary,
                )
            }
        }
    }
}
