package com.schoolapp.feature.progress.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.progress.R

/** Roll number + full name (wraps, never truncated). */
@Composable
internal fun rollName(rollNo: Int?, name: String): String =
    rollNo?.let { stringResource(R.string.progress_roll_name, it, name) } ?: name

@Composable
internal fun StudentRow(student: StudentSummary, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PersonAvatar(student.name, student.photoUrl)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(rollName(student.rollNo, student.name), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                student.admissionNo?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = null, tint = AppColors.TextSecondary)
        }
    }
}
