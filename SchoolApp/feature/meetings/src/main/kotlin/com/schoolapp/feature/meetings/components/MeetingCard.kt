package com.schoolapp.feature.meetings.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R

/**
 * Meeting summary. Staff see the student and guardian ([forStaff]); parents see the teacher and,
 * for past meetings, the summary the teacher shared.
 */
@Composable
internal fun MeetingCard(
    meeting: Meeting,
    forStaff: Boolean,
    modifier: Modifier = Modifier,
    showSummary: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    AppCard(modifier = modifier, onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                val title = if (forStaff) meeting.student?.name else meeting.staff?.name
                Text(
                    text = title ?: stringResource(R.string.meetings_title),
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                StatusChip(stringResource(meeting.status.labelRes()), meeting.status.tone())
            }
            if (forStaff) {
                meeting.guardian?.name?.let { SecondaryLine(stringResource(R.string.meetings_guardian_line, it)) }
            }
            SecondaryLine("${formatDate(meeting.date).orEmpty()}, ${timeRange12(meeting.startTime, meeting.endTime)}")
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(meeting.mode.icon(), contentDescription = null, tint = AppColors.TextSecondary, modifier = Modifier.size(18.dp))
                val mode = stringResource(meeting.mode.labelRes())
                SecondaryLine(listOfNotNull(mode, meeting.location?.takeIf { it.isNotBlank() }).joinToString(" · "))
            }
            meeting.agenda?.takeIf { it.isNotBlank() }?.let {
                Text(stringResource(R.string.meetings_agenda_line, it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            }
            if (showSummary) {
                meeting.summary?.takeIf { it.isNotBlank() }?.let {
                    Text(stringResource(R.string.meetings_summary), style = MaterialTheme.typography.labelLarge, color = AppColors.Primary)
                    Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                }
            }
        }
    }
}

@Composable
private fun SecondaryLine(text: String) {
    Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
}
