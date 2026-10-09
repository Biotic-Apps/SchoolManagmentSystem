package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.dashboard.ChildBrief
import com.schoolapp.feature.dashboard.R

/** The active child: photo (or initials), name, class - section, roll and admission numbers, class teacher. */
@Composable
internal fun ChildProfileCard(summary: ChildSummary, brief: ChildBrief?, modifier: Modifier = Modifier) {
    val name = brief?.name ?: summary.fullName
    val classLine = listOfNotNull(brief?.className ?: summary.className, brief?.sectionName ?: summary.sectionName)
        .filter { it.isNotBlank() }
        .joinToString(" - ")
    val numbers = listOfNotNull(
        brief?.rollNo?.let { stringResource(R.string.dashboard_child_roll_no, it) },
        (brief?.admissionNo ?: summary.admissionNo)?.let { stringResource(R.string.dashboard_child_admission_no, it) },
    ).joinToString(" · ")
    AppCard(modifier.fillMaxWidth()) {
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(name = name, photoUrl = brief?.photoUrl ?: summary.photoUrl, size = 64.dp)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(name, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary, maxLines = 2, overflow = TextOverflow.Ellipsis)
                if (classLine.isNotBlank()) Text(classLine, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                if (numbers.isNotBlank()) Text(numbers, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                brief?.classTeacherName?.let {
                    Text(stringResource(R.string.dashboard_child_class_teacher, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}
