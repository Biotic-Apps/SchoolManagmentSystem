package com.schoolapp.feature.messages.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.messages.R
import java.time.LocalDate

/** Pill-shaped date badge centered in the conversation, like WhatsApp / iMessage. */
@Composable
internal fun DaySeparator(date: LocalDate, today: LocalDate, modifier: Modifier = Modifier) {
    val label = when (date) {
        today -> stringResource(R.string.messages_today)
        today.minusDays(1) -> stringResource(R.string.messages_yesterday)
        else -> TimeFormat.formatDate(date)
    }
    Box(
        modifier = modifier.fillMaxWidth().padding(vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = AppColors.TextSecondary,
            modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(AppColors.Selected)
                .padding(horizontal = 16.dp, vertical = 4.dp),
        )
    }
}
