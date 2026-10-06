package com.schoolapp.feature.meetings.book.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.components.icon
import com.schoolapp.feature.meetings.components.labelRes
import com.schoolapp.feature.meetings.components.timeRange12

/** "9:00 AM – 9:20 AM · Teacher name · In person"; [selected] adds the date and location. */
@Composable
internal fun SlotCard(
    slot: MeetingSlot,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    AppCard(modifier = modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(slot.mode.icon(), contentDescription = null, tint = AppColors.Primary, modifier = Modifier.size(24.dp))
            val parts = listOfNotNull(
                formatDate(slot.date).takeIf { selected },
                timeRange12(slot.startTime, slot.endTime),
                slot.staff?.name,
                stringResource(slot.mode.labelRes()),
                slot.location?.takeIf { selected && it.isNotBlank() },
            )
            Text(
                parts.joinToString(" · "),
                style = MaterialTheme.typography.bodyLarge,
                color = if (selected) AppColors.Primary else AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
        }
    }
}
