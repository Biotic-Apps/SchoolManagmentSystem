package com.schoolapp.feature.accounts.profitloss

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.TrendingDown
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.accounts.ProfitLoss
import com.schoolapp.feature.accounts.R

/** Total income, total expenses and net profit / (loss); three across on wide screens. */
@Composable
internal fun ProfitLossTiles(report: ProfitLoss) {
    val income = @Composable { m: Modifier ->
        StatCard(
            label = stringResource(R.string.accounts_total_income),
            value = MoneyFormat.format(report.totalIncomeMinor),
            icon = Icons.AutoMirrored.Outlined.TrendingUp,
            tone = StatusTone.Success,
            modifier = m,
        )
    }
    val expenses = @Composable { m: Modifier ->
        StatCard(
            label = stringResource(R.string.accounts_total_expenses),
            value = MoneyFormat.format(report.totalExpensesMinor),
            icon = Icons.AutoMirrored.Outlined.TrendingDown,
            tone = StatusTone.Error,
            modifier = m,
        )
    }
    val net = @Composable { m: Modifier ->
        val loss = report.netMinor < 0
        StatCard(
            label = stringResource(R.string.accounts_net),
            value = MoneyFormat.format(report.netMinor),
            icon = Icons.Outlined.AccountBalanceWallet,
            tone = if (loss) StatusTone.Error else StatusTone.Info,
            supporting = stringResource(if (loss) R.string.accounts_net_loss else R.string.accounts_net_profit),
            modifier = m,
        )
    }
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        if (maxWidth >= WIDE) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                income(Modifier.weight(1f))
                expenses(Modifier.weight(1f))
                net(Modifier.weight(1f))
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.height(IntrinsicSize.Min)) {
                    income(Modifier.weight(1f).fillMaxHeight())
                    expenses(Modifier.weight(1f).fillMaxHeight())
                }
                net(Modifier.fillMaxWidth())
            }
        }
    }
}

private val WIDE = 600.dp
