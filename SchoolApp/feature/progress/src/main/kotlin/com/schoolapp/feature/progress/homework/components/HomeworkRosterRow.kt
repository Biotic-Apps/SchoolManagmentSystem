package com.schoolapp.feature.progress.homework.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.feature.progress.components.rollName

@Composable
internal fun HomeworkRosterRow(
    student: StudentSummary,
    status: HomeworkStatus?,
    onSelect: (HomeworkStatus) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                PersonAvatar(student.name, student.photoUrl)
                Text(
                    rollName(student.rollNo, student.name),
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
            }
            HomeworkStatusSegment(status, student.name, onSelect, enabled = enabled)
        }
    }
}
