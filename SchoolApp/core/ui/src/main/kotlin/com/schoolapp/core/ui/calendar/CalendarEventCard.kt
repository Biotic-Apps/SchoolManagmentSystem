package com.schoolapp.core.ui.calendar

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BeachAccess
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material.icons.outlined.WbSunny
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.core.ui.humanizeKey
import androidx.compose.ui.unit.dp

/** A school calendar event: type icon and chip, title, date range and description. Shared by staff and parent calendars. */
@Composable
fun CalendarEventCard(event: CalendarEvent, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = event.title,
            supporting = listOfNotNull(formatDateRange(event.startDate, event.endDate), event.description).joinToString(" · "),
            leadingIcon = when (event.type) {
                "HOLIDAY" -> Icons.Outlined.WbSunny
                "VACATION" -> Icons.Outlined.BeachAccess
                "DEADLINE" -> Icons.Outlined.Flag
                else -> Icons.Outlined.Event
            },
            trailing = { event.type?.let { StatusChip(humanizeKey(it), it.tone()) } },
        )
    }
}

private fun String.tone(): StatusTone = when (this) {
    "HOLIDAY", "VACATION" -> StatusTone.Success
    "DEADLINE" -> StatusTone.Warning
    else -> StatusTone.Info
}
