package com.schoolapp.feature.meetings.staff.slots.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.icon
import com.schoolapp.feature.meetings.components.labelRes
import com.schoolapp.feature.meetings.components.timeRange12

/** One of the caller's slots: time, mode, location, Free/Booked; free slots offer "Remove". */
@Composable
internal fun MySlotCard(
    slot: MeetingSlot,
    free: Boolean,
    deleting: Boolean,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(slot.mode.icon(), contentDescription = null, tint = AppColors.Primary, modifier = Modifier.size(24.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(timeRange12(slot.startTime, slot.endTime), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(
                    listOfNotNull(stringResource(slot.mode.labelRes()), slot.location?.takeIf { it.isNotBlank() }).joinToString(" · "),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
            }
            if (free) {
                StatusChip(stringResource(R.string.meetings_slot_open), StatusTone.Success)
                Box(Modifier.size(48.dp), contentAlignment = Alignment.Center) {
                    if (deleting) {
                        CircularProgressIndicator(Modifier.size(20.dp), color = AppColors.Primary, strokeWidth = 2.dp)
                    } else {
                        IconButton(onClick = onDelete) {
                            Icon(Icons.Outlined.Delete, stringResource(R.string.meetings_remove_slot), tint = AppColors.Error)
                        }
                    }
                }
            } else {
                StatusChip(stringResource(R.string.meetings_slot_booked), StatusTone.Info)
            }
        }
    }
}
