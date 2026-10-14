package com.schoolapp.feature.questionbank.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.optionLetter

/** Question text, MCQ choices (tap the circle of the right one) and the correct answer. */
@Composable
internal fun ContentFields(state: QuestionFormUiState, viewModel: QuestionFormViewModel) {
    val enabled = !state.isSaving
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(stringResource(R.string.qb_section_content))
        AppTextArea(
            value = state.text,
            onValueChange = viewModel::onText,
            label = stringResource(R.string.qb_field_question),
            enabled = enabled,
            minLines = 4,
            maxLines = 10,
            errorText = state.fieldError(QuestionField.TEXT),
        )
        when (state.type) {
            QuestionType.MCQ -> McqOptions(state, viewModel, enabled)
            QuestionType.TRUE_FALSE -> Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(stringResource(R.string.qb_correct_answer), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
                val labels = listOf(stringResource(R.string.qb_true), stringResource(R.string.qb_false))
                SegmentedChoice(
                    labels = labels,
                    selectedIndex = TRUE_FALSE.indexOfFirst { it.equals(state.answer.trim(), ignoreCase = true) },
                    onSelect = { if (enabled) viewModel.onAnswer(TRUE_FALSE[it]) },
                )
                FieldErrorText(state.fieldError(QuestionField.ANSWER))
            }
            else -> AppTextArea(
                value = state.answer,
                onValueChange = viewModel::onAnswer,
                label = stringResource(R.string.qb_correct_answer),
                enabled = enabled,
                minLines = 2,
                errorText = state.fieldError(QuestionField.ANSWER),
            )
        }
    }
}

@Composable
private fun McqOptions(state: QuestionFormUiState, viewModel: QuestionFormViewModel, enabled: Boolean) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.qb_options_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        state.options.forEachIndexed { index, option ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                RadioButton(selected = state.correctIndex == index, onClick = { viewModel.onCorrect(index) }, enabled = enabled)
                AppTextField(
                    value = option,
                    onValueChange = { viewModel.onOption(index, it) },
                    label = stringResource(R.string.qb_option_label, optionLetter(index)),
                    enabled = enabled,
                    modifier = Modifier.weight(1f),
                )
                if (state.canRemoveOption) {
                    IconButton(onClick = { viewModel.removeOption(index) }, enabled = enabled) {
                        Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.qb_remove_option), tint = AppColors.TextSecondary)
                    }
                }
            }
        }
        FieldErrorText(state.fieldError(QuestionField.OPTIONS) ?: state.fieldError(QuestionField.ANSWER))
        if (state.canAddOption) {
            AppTextButton(stringResource(R.string.qb_add_option), viewModel::addOption, enabled = enabled, leadingIcon = Icons.Outlined.Add)
        }
    }
}

@Composable
internal fun FieldErrorText(text: String?) {
    if (text != null) Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
}

private val TRUE_FALSE = listOf("True", "False")
