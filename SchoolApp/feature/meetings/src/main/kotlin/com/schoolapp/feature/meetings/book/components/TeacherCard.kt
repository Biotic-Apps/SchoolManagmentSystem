package com.schoolapp.feature.meetings.book.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.meeting.MeetingTeacher
import com.schoolapp.feature.meetings.R

/** "Ms Aqsa · Class teacher, English · 2 open times" (or "No open times yet"). */
@Composable
internal fun TeacherCard(
    teacher: MeetingTeacher,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(
                if (selected) Icons.Outlined.CheckCircle else Icons.Outlined.Person,
                contentDescription = null,
                tint = if (selected) AppColors.Primary else AppColors.TextSecondary,
                modifier = Modifier.size(24.dp),
            )
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    teacher.name,
                    style = MaterialTheme.typography.titleSmall,
                    color = if (selected) AppColors.Primary else AppColors.TextPrimary,
                )
                if (teacher.roles.isNotEmpty()) {
                    Text(teacher.roles.joinToString(", "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                Text(
                    if (teacher.openSlots == 0) {
                        stringResource(R.string.meetings_teacher_no_open_times)
                    } else {
                        pluralStringResource(R.plurals.meetings_teacher_open_times, teacher.openSlots, teacher.openSlots)
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = if (teacher.openSlots == 0) AppColors.TextSecondary else AppColors.Success,
                )
            }
        }
    }
}
