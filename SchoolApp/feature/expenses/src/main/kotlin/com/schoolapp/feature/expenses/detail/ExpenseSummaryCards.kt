package com.schoolapp.feature.expenses.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpensePayment
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.common.formatMonth
import com.schoolapp.feature.expenses.common.labelRes

/** Category, vendor, dates, paid/balance, repeat schedule and notes. */
@Composable
internal fun ExpenseSummaryCard(expense: Expense) {
    val dash = stringResource(R.string.expenses_dash)
    AppCard(modifier = Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(title = stringResource(R.string.expenses_details))
        KeyValueRow(stringResource(R.string.expenses_field_category), expense.categoryName ?: dash)
        KeyValueRow(stringResource(R.string.expenses_field_vendor), expense.vendorName ?: stringResource(R.string.expenses_no_vendor))
        KeyValueRow(stringResource(R.string.expenses_field_bill_date), formatDate(expense.billDate) ?: dash)
        KeyValueRow(stringResource(R.string.expenses_field_due_date), formatDate(expense.dueDate) ?: dash)
        KeyValueRow(stringResource(R.string.expenses_field_recurring_short), recurringText(expense))
        KeyValueRow(stringResource(R.string.expenses_field_notes), expense.notes?.takeIf { it.isNotBlank() } ?: dash)
        HorizontalDivider(color = AppColors.Border)
        MoneyRow(stringResource(R.string.expenses_total_amount), expense.amountMinor)
        MoneyRow(stringResource(R.string.expenses_total_paid), expense.paidMinor)
        MoneyRow(stringResource(R.string.expenses_total_balance), expense.balanceMinor, emphasized = true)
    }
}

@Composable
private fun recurringText(expense: Expense): String {
    if (!expense.recurringMonthly) return stringResource(R.string.expenses_no)
    val until = formatMonth(expense.recurringUntil) ?: return stringResource(R.string.expenses_monthly)
    return stringResource(R.string.expenses_monthly_until, until)
}

/** Payments recorded against the bill, oldest first. */
@Composable
internal fun ExpensePaymentsCard(payments: List<ExpensePayment>) {
    AppCard(modifier = Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(title = stringResource(R.string.expenses_payments))
        if (payments.isEmpty()) {
            EmptyState(
                title = stringResource(R.string.expenses_payments_empty),
                message = stringResource(R.string.expenses_payments_empty_message),
                icon = Icons.Outlined.Payments,
            )
            return@AppCard
        }
        payments.forEachIndexed { index, payment ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            PaymentRow(payment)
        }
    }
}

@Composable
private fun PaymentRow(payment: ExpensePayment) {
    val method = payment.method?.let { stringResource(it.labelRes()) }
    val supporting = listOfNotNull(method, payment.reference?.takeIf { it.isNotBlank() }).joinToString(" · ")
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        MoneyRow(formatDate(payment.paidOn) ?: payment.paidOn, payment.amountMinor)
        if (supporting.isNotEmpty()) {
            Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}
