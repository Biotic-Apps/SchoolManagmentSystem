package com.schoolapp.feature.expenses.list.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Repeat
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.common.statusLabel
import com.schoolapp.feature.expenses.common.tone

/** One bill in the list: title, category · vendor, dates, amount, balance and status. */
@Composable
internal fun ExpenseCard(
    expense: Expense,
    categoryName: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier.fillMaxWidth(), onClick = onClick, verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    expense.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                val noVendor = stringResource(R.string.expenses_no_vendor)
                Text(
                    listOfNotNull(categoryName, expense.vendorName ?: noVendor).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            StatusChip(statusLabel(expense.status), expense.status.tone())
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                dateLine(expense),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                modifier = Modifier.weight(1f),
            )
            MoneyText(expense.amountMinor, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
        }
        if (expense.recurringMonthly || expense.paidMinor > 0) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (expense.recurringMonthly) {
                    StatusChip(stringResource(R.string.expenses_monthly), StatusTone.Info, icon = Icons.Outlined.Repeat)
                }
                if (expense.paidMinor > 0) {
                    Text(
                        stringResource(
                            R.string.expenses_paid_balance,
                            MoneyFormat.format(expense.paidMinor),
                            MoneyFormat.format(expense.balanceMinor),
                        ),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.End,
                    )
                }
            }
        }
    }
}

@Composable
private fun dateLine(expense: Expense): String {
    val bill = stringResource(R.string.expenses_bill_on, formatDate(expense.billDate).orEmpty())
    val due = formatDate(expense.dueDate) ?: return bill
    return bill + " · " + stringResource(R.string.expenses_due_on, due)
}
