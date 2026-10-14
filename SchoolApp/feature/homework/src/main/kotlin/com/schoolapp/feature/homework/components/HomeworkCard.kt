package com.schoolapp.feature.homework.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.ui.attachments.AttachmentLinks
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.homework.R

/** Homework summary; [compact] is the parent view (no submission counts, "View / Submit"). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun HomeworkCard(homework: Homework, onSelect: () -> Unit, modifier: Modifier = Modifier, compact: Boolean = false) {
    AppCard(modifier = modifier.fillMaxWidth(), onClick = onSelect, verticalSpacing = 10.dp) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f)) {
                Text(
                    homework.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(subtitle(homework), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            HomeworkStatusChip(homework.status)
        }
        if (homework.description.isNotBlank()) {
            Text(
                homework.description,
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            MetaText(stringResource(R.string.homework_due_on, formatDate(homework.dueDate).orEmpty()))
            dueLabel(homework.dueDate)?.let { due -> MetaText(due.text, if (due.overdue) AppColors.Error else AppColors.TextSecondary) }
            homework.maxMarks?.let { MetaText(stringResource(R.string.homework_max_marks, it)) }
            if (!compact) MetaText(stringResource(R.string.homework_counts, homework.submissionCount, homework.gradedCount))
        }
        AttachmentLinks(homework.attachments)
        SecondaryButton(
            text = stringResource(if (compact) R.string.homework_view_submit else R.string.homework_view_submissions),
            onClick = onSelect,
            leadingIcon = if (compact) Icons.AutoMirrored.Outlined.Assignment else Icons.Outlined.Groups,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun MetaText(text: String, color: Color = AppColors.TextSecondary) {
    Text(text, style = MaterialTheme.typography.labelMedium, color = color)
}

private fun subtitle(homework: Homework): String =
    listOfNotNull(
        homework.subjectName.ifBlank { null },
        listOfNotNull(homework.className, homework.sectionName).joinToString(" ").ifBlank { null },
    ).joinToString(" · ")
