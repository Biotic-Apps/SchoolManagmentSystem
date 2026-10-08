package com.schoolapp.feature.fees.staff.today.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.DayClosing
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.fees.R

/** Stored cash count of a closed day (web `CollectionClosingCard`). */
@Composable
internal fun DayClosingCard(closing: DayClosing, currency: String, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier) {
        Text(stringResource(R.string.fees_day_closed_title), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        InlineMessage(stringResource(R.string.fees_day_closed_banner), StatusTone.Warning)
        MoneyRow(stringResource(R.string.fees_expected_cash), closing.cashExpectedMinor, currency = currency)
        MoneyRow(stringResource(R.string.fees_cash_counted), closing.cashCountedMinor, currency = currency)
        MoneyRow(stringResource(R.string.fees_cash_difference), closing.differenceMinor, currency = currency)
        KeyValueRow(stringResource(R.string.fees_closed_by), closing.closedBy)
        KeyValueRow(stringResource(R.string.fees_closed_at), formatTimestamp(closing.closedAt))
        closing.note?.let { KeyValueRow(stringResource(R.string.fees_close_note), it) }
    }
}
