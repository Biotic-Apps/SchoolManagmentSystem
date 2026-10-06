package com.schoolapp.feature.fees.staff.today.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label

/** Day total with per-method and per-cashier breakdowns. */
@Composable
internal fun DailyCollectionCard(collection: DailyCollection, currency: String, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier) {
        MoneyRow(
            label = stringResource(R.string.fees_day_total),
            amountMinor = collection.totalMinor,
            currency = currency,
            supporting = pluralStringResource(R.plurals.fees_payment_count, collection.payments.size, collection.payments.size),
            emphasized = true,
        )
        if (collection.byMethod.isNotEmpty()) {
            HorizontalDivider(color = AppColors.Border)
            Text(stringResource(R.string.fees_by_method), style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
            Column {
                collection.byMethod.forEach { row ->
                    MoneyRow(
                        label = row.method.label(),
                        amountMinor = row.amountMinor,
                        currency = currency,
                        supporting = pluralStringResource(R.plurals.fees_payment_count, row.count, row.count),
                    )
                }
            }
        }
        if (collection.byCashier.isNotEmpty()) {
            HorizontalDivider(color = AppColors.Border)
            Text(stringResource(R.string.fees_by_cashier), style = MaterialTheme.typography.titleSmall, color = AppColors.TextSecondary)
            Column {
                collection.byCashier.forEach { row ->
                    MoneyRow(
                        label = row.cashierName.ifBlank { stringResource(R.string.fees_unknown_cashier) },
                        amountMinor = row.amountMinor,
                        currency = currency,
                        supporting = pluralStringResource(R.plurals.fees_payment_count, row.count, row.count),
                    )
                }
            }
        }
    }
}
