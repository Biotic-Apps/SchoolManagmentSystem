package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.runs.RunTotals

/** Net payable (with staff count), paid and balance of the lines shown. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun RunTotalsRow(totals: RunTotals, staffCount: Int, currency: String, modifier: Modifier = Modifier) {
    FlowRow(
        modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        maxItemsInEachRow = 3,
    ) {
        val tile = Modifier.weight(1f).widthIn(min = 150.dp)
        StatCard(
            label = stringResource(R.string.payroll_net_payable),
            value = MoneyFormat.format(totals.netMinor, currency),
            supporting = pluralStringResource(R.plurals.payroll_staff_members, staffCount, staffCount),
            modifier = tile,
        )
        StatCard(
            label = stringResource(R.string.payroll_paid),
            value = MoneyFormat.format(totals.paidMinor, currency),
            tone = StatusTone.Success,
            modifier = tile,
        )
        StatCard(
            label = stringResource(R.string.payroll_balance),
            value = MoneyFormat.format(totals.balanceMinor, currency),
            tone = if (totals.balanceMinor > 0) StatusTone.Warning else StatusTone.Neutral,
            modifier = tile,
        )
    }
}
