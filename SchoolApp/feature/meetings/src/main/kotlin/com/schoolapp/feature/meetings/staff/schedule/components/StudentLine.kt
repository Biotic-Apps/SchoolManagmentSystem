package com.schoolapp.feature.meetings.staff.schedule.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.meetings.R

/** Student name with class/section and admission number; wraps instead of truncating. */
@Composable
internal fun StudentLine(
    student: StudentSummary,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    trailing: (@Composable () -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        PersonAvatar(student.name, student.photoUrl)
        Column(Modifier.weight(1f)) {
            Text(student.name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            val details = listOfNotNull(
                listOfNotNull(student.className, student.sectionName).joinToString(" ").ifBlank { null },
                student.admissionNo?.let { stringResource(R.string.meetings_admission_no, it) },
            ).joinToString(" · ")
            if (details.isNotBlank()) {
                Text(details, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        trailing?.invoke()
    }
}
