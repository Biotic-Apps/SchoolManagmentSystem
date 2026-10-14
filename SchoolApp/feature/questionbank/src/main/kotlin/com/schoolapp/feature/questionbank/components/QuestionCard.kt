package com.schoolapp.feature.questionbank.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.Question
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.difficultyLabel
import com.schoolapp.feature.questionbank.common.difficultyTone
import com.schoolapp.feature.questionbank.common.typeLabel

/** Question row: text preview, then subject · class · chapter and type / difficulty / marks chips. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun QuestionCard(question: Question, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier.fillMaxWidth(), onClick = onClick, verticalSpacing = 8.dp) {
        Text(
            text = question.text,
            style = MaterialTheme.typography.titleSmall,
            color = AppColors.TextPrimary,
            maxLines = 3,
            overflow = TextOverflow.Ellipsis,
        )
        Text(
            text = questionContext(question),
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            StatusChip(typeLabel(question.type), StatusTone.Neutral)
            StatusChip(difficultyLabel(question.difficulty), difficultyTone(question.difficulty))
            StatusChip(pluralStringResource(R.plurals.qb_marks, question.marks, question.marks), StatusTone.Info)
        }
    }
}

internal fun questionContext(question: Question): String =
    listOfNotNull(question.subjectName, question.className, question.chapterName.takeIf { it.isNotBlank() })
        .joinToString(" · ")
