package com.schoolapp.feature.students.profile

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.students.components.sectionLabel

@Composable
internal fun StudentHeaderCard(student: StudentSummary, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(student.name, student.photoUrl, size = 64.dp)
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(student.name, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary)
                val subtitle = listOfNotNull(sectionLabel(student.className, student.sectionName), student.admissionNo)
                if (subtitle.isNotEmpty()) {
                    Text(subtitle.joinToString(" · "), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
            student.status?.let { StatusChip(humanizeKey(it), statusTone(it)) }
        }
    }
}
