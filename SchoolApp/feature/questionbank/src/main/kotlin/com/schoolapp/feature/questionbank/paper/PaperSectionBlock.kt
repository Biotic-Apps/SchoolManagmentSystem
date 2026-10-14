package com.schoolapp.feature.questionbank.paper

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.PaperSection
import com.schoolapp.core.model.questions.Question
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.optionLetter

/** A section heading with its numbered questions, choices and answers (a teacher's preview of the paper). */
@Composable
internal fun PaperSectionBlock(section: PaperSection, questions: Map<String, Question>, loading: Boolean) {
    AppCard(modifier = Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(
            title = section.title,
            subtitle = pluralStringResource(R.plurals.qb_questions, section.questionIds.size, section.questionIds.size) +
                " · " + pluralStringResource(R.plurals.qb_marks, section.marks, section.marks),
        )
        section.questionIds.forEachIndexed { index, id ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            val question = questions[id]
            when {
                question != null -> QuestionPreview(index + 1, question)
                loading -> Text(stringResource(R.string.qb_loading_question, index + 1), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                else -> Text(stringResource(R.string.qb_question_unavailable, index + 1), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
    }
}

@Composable
private fun QuestionPreview(number: Int, question: Question) {
    Column(Modifier.padding(vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = stringResource(R.string.qb_numbered_question, number, question.text, question.marks),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextPrimary,
        )
        question.options.forEachIndexed { i, option ->
            Text("${optionLetter(i)} $option", style = MaterialTheme.typography.bodySmall, color = AppColors.TextPrimary, modifier = Modifier.padding(start = 12.dp))
        }
        Text(
            text = stringResource(R.string.qb_answer_line, question.correctAnswer),
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
        )
    }
}
