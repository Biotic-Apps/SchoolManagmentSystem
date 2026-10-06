package com.schoolapp.feature.messages.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.messages.R
import java.time.LocalDate

/** "Today", "Yesterday" or the date between two thin rules. */
@Composable
internal fun DaySeparator(date: LocalDate, today: LocalDate, modifier: Modifier = Modifier) {
    val label = when (date) {
        today -> stringResource(R.string.messages_today)
        today.minusDays(1) -> stringResource(R.string.messages_yesterday)
        else -> TimeFormat.formatDate(date)
    }
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        HorizontalDivider(Modifier.weight(1f), color = AppColors.Border)
        Text(label, style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
        HorizontalDivider(Modifier.weight(1f), color = AppColors.Border)
    }
}
