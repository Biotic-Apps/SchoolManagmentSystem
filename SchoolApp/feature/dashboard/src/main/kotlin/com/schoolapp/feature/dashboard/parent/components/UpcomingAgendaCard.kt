package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.parent.eventKind

/** Upcoming parent-teacher meetings, then school events (holidays, activities, deadlines). */
@Composable
internal fun UpcomingAgendaCard(
    meetings: List<Meeting>,
    events: List<CalendarEvent>,
    onOpenMeetings: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier) {
        SectionHeader(
            title = stringResource(R.string.dashboard_upcoming_title),
            action = onOpenMeetings?.let { open -> { AppTextButton(stringResource(R.string.dashboard_view_all), open) } },
        )
        if (meetings.isEmpty() && events.isEmpty()) {
            CardEmptyHint(stringResource(R.string.dashboard_upcoming_empty), stringResource(R.string.dashboard_upcoming_hint))
        }
        meetings.forEachIndexed { index, meeting ->
            if (index > 0) Divider()
            MeetingBlock(meeting)
        }
        events.forEachIndexed { index, event ->
            if (index > 0 || meetings.isNotEmpty()) Divider()
            val kind = eventKind(event.type)
            AgendaRow(
                icon = Icons.Outlined.Event,
                title = event.title,
                supporting = formatDateRange(event.startDate, event.endDate),
                chip = stringResource(kind.labelRes) to kind.tone,
            )
        }
    }
}

@Composable
private fun MeetingBlock(meeting: Meeting) {
    val time = listOfNotNull(formatDate(meeting.date), formatTime(meeting.startTime)).joinToString(", ")
    val teacher = meeting.staff?.name
    AgendaRow(
        icon = Icons.Outlined.EventAvailable,
        title = teacher?.let { stringResource(R.string.dashboard_meeting_with, stringResource(R.string.dashboard_meeting_label), it) }
            ?: stringResource(R.string.dashboard_meeting_label),
        supporting = time,
        chip = if (meeting.status == MeetingStatus.REQUESTED) {
            stringResource(R.string.dashboard_meeting_requested) to StatusTone.Warning
        } else {
            null
        },
    )
}

@Composable
private fun AgendaRow(icon: ImageVector, title: String, supporting: String?, chip: Pair<String, StatusTone>?) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = AppColors.TextSecondary)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary, maxLines = 2, overflow = TextOverflow.Ellipsis)
            supporting?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        }
        chip?.let { (label, tone) -> StatusChip(label, tone) }
    }
}

@Composable
private fun Divider() = HorizontalDivider(Modifier.padding(vertical = 8.dp), color = AppColors.Border)
