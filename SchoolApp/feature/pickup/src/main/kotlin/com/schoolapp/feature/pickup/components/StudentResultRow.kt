package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary

/** Search result row; labels wrap instead of truncating. */
@Composable
internal fun StudentResultRow(student: StudentSummary, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .heightIn(min = 56.dp)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        PersonAvatar(name = student.name, photoUrl = student.photoUrl)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(student.name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            val supporting = listOfNotNull(
                listOfNotNull(student.className, student.sectionName).joinToString(" - ").ifBlank { null },
                student.admissionNo,
            ).joinToString(" · ")
            if (supporting.isNotBlank()) {
                Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
}
