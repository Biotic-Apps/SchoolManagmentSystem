package com.schoolapp.feature.meetings.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.FollowUpStatus
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R

/** Notes, shared summary and follow-ups of a completed meeting. */
@Composable
internal fun MeetingOutcomeCard(meeting: Meeting, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            meeting.notes?.takeIf { it.isNotBlank() }?.let { Block(stringResource(R.string.meetings_notes), it) }
            meeting.summary?.takeIf { it.isNotBlank() }?.let { Block(stringResource(R.string.meetings_summary_shared), it) }
            if (meeting.followUps.isNotEmpty()) {
                Text(stringResource(R.string.meetings_follow_ups), style = MaterialTheme.typography.labelLarge, color = AppColors.Primary)
                meeting.followUps.forEach { followUp ->
                    val details = listOfNotNull(followUp.ownerName, formatDate(followUp.dueDate)).joinToString(" · ")
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(followUp.title, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                        if (details.isNotEmpty()) Text(details, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                        val done = followUp.status == FollowUpStatus.DONE
                        StatusChip(
                            stringResource(if (done) R.string.meetings_follow_up_done else R.string.meetings_follow_up_open),
                            if (done) StatusTone.Success else StatusTone.Warning,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun Block(title: String, body: String) {
    Text(title, style = MaterialTheme.typography.labelLarge, color = AppColors.Primary)
    Text(body, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
}

internal fun Meeting.hasOutcome(): Boolean = !notes.isNullOrBlank() || !summary.isNullOrBlank() || followUps.isNotEmpty()
