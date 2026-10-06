package com.schoolapp.feature.meetings.staff.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R

/** Open follow-up; the due date turns error-coloured once it is before [today]. */
@Composable
internal fun FollowUpCard(
    followUp: FollowUp,
    today: String,
    busy: Boolean,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val dueDate = followUp.dueDate
    val overdue = dueDate != null && dueDate < today
    AppCard(modifier) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(followUp.title, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                followUp.studentName?.takeIf { it.isNotBlank() }?.let {
                    Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
                formatDate(followUp.dueDate)?.let { due ->
                    val text = if (overdue) stringResource(R.string.meetings_follow_up_overdue, due) else stringResource(R.string.meetings_follow_up_due, due)
                    Text(text, style = MaterialTheme.typography.bodyMedium, color = if (overdue) AppColors.Error else AppColors.TextSecondary)
                }
            }
            SecondaryButton(stringResource(R.string.meetings_mark_done), onDone, loading = busy, enabled = !busy)
        }
    }
}
