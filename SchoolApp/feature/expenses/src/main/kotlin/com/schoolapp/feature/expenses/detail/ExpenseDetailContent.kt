package com.schoolapp.feature.expenses.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material.icons.outlined.Repeat
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyText
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.expenses.Expense
import com.schoolapp.core.model.expenses.ExpenseStatus
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.common.statusLabel
import com.schoolapp.feature.expenses.common.tone

internal class ExpenseDetailActions(
    val onRefresh: () -> Unit,
    val onSubmit: () -> Unit,
    val onPay: () -> Unit,
    val onOpenBill: (String) -> Unit,
)

@Composable
internal fun ExpenseDetailContent(
    state: ExpenseDetailUiState,
    expense: Expense,
    actions: ExpenseDetailActions,
    modifier: Modifier = Modifier,
) {
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh, modifier = modifier) {
        ScreenColumn(contentPadding = PaddingValues(16.dp), itemSpacing = 12.dp) {
            state.actionError?.let { item(key = "action_error") { InlineMessage(actionErrorMessage(it), StatusTone.Error) } }
            item(key = "header") { ExpenseHeaderCard(expense) }
            statusHint(expense.status)?.let { hint -> item(key = "hint") { InlineMessage(stringResource(hint), StatusTone.Info) } }
            item(key = "actions") { ActionButtons(state, expense, actions) }
            item(key = "summary") { ExpenseSummaryCard(expense) }
            item(key = "payments") { ExpensePaymentsCard(expense.payments) }
        }
    }
}

@Composable
private fun ExpenseHeaderCard(expense: Expense) {
    AppCard(modifier = Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(expense.title, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            StatusChip(statusLabel(expense.status), expense.status.tone())
        }
        MoneyText(
            expense.amountMinor,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Start,
        )
        if (expense.recurringMonthly) {
            StatusChip(stringResource(R.string.expenses_monthly), StatusTone.Info, icon = Icons.Outlined.Repeat)
        }
    }
}

@Composable
private fun ActionButtons(state: ExpenseDetailUiState, expense: Expense, actions: ExpenseDetailActions) {
    val bill = expense.billUrl
    if (!state.canSubmit && !state.canPay && bill == null) return
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.canSubmit) {
            PrimaryButton(
                text = stringResource(R.string.expenses_submit),
                onClick = actions.onSubmit,
                loading = state.isSubmitting,
                leadingIcon = Icons.AutoMirrored.Outlined.Send,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (state.canPay) {
            PrimaryButton(
                text = stringResource(R.string.expenses_record_payment),
                onClick = actions.onPay,
                leadingIcon = Icons.Outlined.Payments,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (bill != null) {
            SecondaryButton(
                text = stringResource(R.string.expenses_open_bill),
                onClick = { actions.onOpenBill(bill) },
                leadingIcon = Icons.Outlined.Description,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

private fun statusHint(status: ExpenseStatus): Int? = when (status) {
    ExpenseStatus.DRAFT -> R.string.expenses_hint_draft
    ExpenseStatus.SUBMITTED -> R.string.expenses_hint_submitted
    ExpenseStatus.REJECTED -> R.string.expenses_hint_rejected
    else -> null
}
