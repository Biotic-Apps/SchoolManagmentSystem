package com.schoolapp.feature.questionbank.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.paperStatusLabel
import com.schoolapp.feature.questionbank.common.paperStatusTone

/** Paper summary: title + status, subject · class, then marks / duration / sections. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun PaperCard(paper: ExamPaper, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    AppCard(modifier = modifier.fillMaxWidth(), onClick = onClick, verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = paper.title,
                style = MaterialTheme.typography.titleMedium,
                color = AppColors.TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f),
            )
            StatusChip(paperStatusLabel(paper.status), paperStatusTone(paper.status))
        }
        Text(
            text = listOfNotNull(paper.subjectName, paper.className).joinToString(" · ").ifBlank { "-" },
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            StatusChip(pluralStringResource(R.plurals.qb_marks, paper.totalMarks, paper.totalMarks), StatusTone.Info)
            StatusChip(stringResource(R.string.qb_minutes, paper.durationMinutes), StatusTone.Neutral)
            StatusChip(pluralStringResource(R.plurals.qb_sections, paper.sections.size, paper.sections.size), StatusTone.Neutral)
            StatusChip(pluralStringResource(R.plurals.qb_questions, paper.questionCount, paper.questionCount), StatusTone.Neutral)
        }
    }
}
