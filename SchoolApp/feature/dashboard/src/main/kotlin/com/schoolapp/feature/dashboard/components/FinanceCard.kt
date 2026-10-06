package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.finance.FinanceCardState
import com.schoolapp.feature.dashboard.finance.collectionRateLabel
import com.schoolapp.feature.dashboard.finance.financeMonthLabel

/** Month's money at a glance; a load failure stays inside the card. Tapping opens the fees menu when [onClick] is set. */
@Composable
internal fun FinanceCard(state: FinanceCardState, onClick: (() -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onClick) {
        SectionHeader(title = stringResource(R.string.dashboard_finance_title), subtitle = financeMonthLabel(state.month))
        val overview = state.overview
        when {
            state.error != null -> InlineMessage(appErrorMessage(state.error), StatusTone.Error)
            overview != null -> {
                MoneyRow(stringResource(R.string.dashboard_finance_collected), overview.collectedMinor, emphasized = true)
                MoneyRow(stringResource(R.string.dashboard_finance_outstanding), overview.outstandingMinor)
                MoneyRow(
                    stringResource(R.string.dashboard_finance_overdue), overview.overdueMinor,
                    amountColor = if (overview.overdueMinor > 0) AppColors.Error else AppColors.TextPrimary,
                )
                KeyValueRow(stringResource(R.string.dashboard_finance_rate), collectionRateLabel(overview.collectionRate))
                MoneyRow(stringResource(R.string.dashboard_finance_today), overview.todayCollectedMinor)
                HorizontalDivider(color = AppColors.Border)
                MoneyRow(stringResource(R.string.dashboard_finance_expenses), overview.expensesMinor)
                MoneyRow(stringResource(R.string.dashboard_finance_payroll), overview.payrollMinor)
            }
        }
    }
}
