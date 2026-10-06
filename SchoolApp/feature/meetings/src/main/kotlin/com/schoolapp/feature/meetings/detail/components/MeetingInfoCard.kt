package com.schoolapp.feature.meetings.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.components.labelRes
import com.schoolapp.feature.meetings.components.timeRange12
import com.schoolapp.feature.meetings.components.tone

@Composable
internal fun MeetingInfoCard(meeting: Meeting, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                meeting.student?.name ?: stringResource(R.string.meetings_title),
                style = MaterialTheme.typography.titleLarge,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(stringResource(meeting.status.labelRes()), meeting.status.tone())
        }
        Spacer(Modifier.height(8.dp))
        KeyValueRow(stringResource(R.string.meetings_guardian), meeting.guardian?.name)
        KeyValueRow(stringResource(R.string.meetings_staff), meeting.staff?.name)
        KeyValueRow(stringResource(R.string.meetings_date), formatDate(meeting.date))
        KeyValueRow(stringResource(R.string.meetings_time), timeRange12(meeting.startTime, meeting.endTime))
        KeyValueRow(stringResource(R.string.meetings_mode), stringResource(meeting.mode.labelRes()))
        meeting.location?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.meetings_location), it) }
        KeyValueRow(stringResource(R.string.meetings_agenda), meeting.agenda)
    }
}
