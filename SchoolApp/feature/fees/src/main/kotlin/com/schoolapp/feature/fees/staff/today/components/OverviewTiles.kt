package com.schoolapp.feature.fees.staff.today.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.FinanceOverview
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.MoneyTile
import kotlin.math.roundToInt

private const val GOOD_RATE = 80
private const val FAIR_RATE = 50

/** Today collected, this month, outstanding, overdue and the collection rate. */
@Composable
internal fun OverviewTiles(overview: FinanceOverview, todayCollectedMinor: Long, currency: String, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        TilePair(
            first = { MoneyTile(stringResource(R.string.fees_today_collected), todayCollectedMinor, currency, it, AppColors.Success) },
            second = { MoneyTile(stringResource(R.string.fees_month_collected), overview.collectedMinor, currency, it) },
        )
        TilePair(
            first = { MoneyTile(stringResource(R.string.fees_outstanding), overview.outstandingMinor, currency, it) },
            second = { MoneyTile(stringResource(R.string.fees_overdue), overview.overdueMinor, currency, it, AppColors.Error) },
        )
        val rate = overview.collectionRate.roundToInt().coerceIn(0, 100)
        ProgressRow(
            title = stringResource(R.string.fees_collection_rate),
            percent = rate,
            tone = when {
                rate >= GOOD_RATE -> StatusTone.Success
                rate >= FAIR_RATE -> StatusTone.Warning
                else -> StatusTone.Error
            },
        )
    }
}

@Composable
private fun TilePair(first: @Composable (Modifier) -> Unit, second: @Composable (Modifier) -> Unit) {
    Row(Modifier.height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        first(Modifier.weight(1f).fillMaxHeight())
        second(Modifier.weight(1f).fillMaxHeight())
    }
}
