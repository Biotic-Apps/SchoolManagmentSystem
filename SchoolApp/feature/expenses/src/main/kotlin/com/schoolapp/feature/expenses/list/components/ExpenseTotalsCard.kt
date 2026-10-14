package com.schoolapp.feature.expenses.list.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.expenses.R

/** Amount, paid and balance of the bills listed; says when more pages are still to load. */
@Composable
internal fun ExpenseTotalsCard(
    shown: Int,
    total: Int,
    amountMinor: Long,
    paidMinor: Long,
    balanceMinor: Long,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        Text(
            if (shown < total) {
                stringResource(R.string.expenses_totals_partial, shown, total)
            } else {
                pluralStringResource(R.plurals.expenses_totals_all, total, total)
            },
            style = MaterialTheme.typography.labelLarge,
            color = AppColors.TextSecondary,
        )
        MoneyRow(stringResource(R.string.expenses_total_amount), amountMinor)
        MoneyRow(stringResource(R.string.expenses_total_paid), paidMinor)
        MoneyRow(stringResource(R.string.expenses_total_balance), balanceMinor, emphasized = true)
    }
}
