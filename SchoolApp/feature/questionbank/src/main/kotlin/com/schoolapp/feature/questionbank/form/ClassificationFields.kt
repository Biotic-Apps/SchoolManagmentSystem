package com.schoolapp.feature.questionbank.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.difficultyLabel
import com.schoolapp.feature.questionbank.common.typeOptions

/** Subject, class, chapter, type, difficulty and marks. */
@Composable
internal fun ClassificationFields(state: QuestionFormUiState, viewModel: QuestionFormViewModel) {
    val enabled = !state.isSaving
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(stringResource(R.string.qb_section_classification))
        CreatablePickerField(
            label = stringResource(R.string.qb_field_subject),
            options = state.catalog.subjects,
            selectedId = state.subjectId,
            onSelect = viewModel::onSubject,
            enabled = enabled && !state.isEdit,
            errorText = state.fieldError(QuestionField.SUBJECT),
            fallbackValue = state.subjectName,
        )
        CreatablePickerField(
            label = stringResource(R.string.qb_field_class),
            options = state.catalog.classes,
            selectedId = state.classId,
            onSelect = viewModel::onClass,
            enabled = enabled && !state.isEdit,
            errorText = state.fieldError(QuestionField.CLASS),
            fallbackValue = state.className,
        )
        if (state.isEdit) {
            Text(stringResource(R.string.qb_subject_class_locked), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        AppTextField(
            value = state.chapter,
            onValueChange = viewModel::onChapter,
            label = stringResource(R.string.qb_field_chapter),
            enabled = enabled,
            errorText = state.fieldError(QuestionField.CHAPTER),
        )
        CreatablePickerField(
            label = stringResource(R.string.qb_field_type),
            options = typeOptions(),
            selectedId = state.type?.key,
            onSelect = viewModel::onType,
            enabled = enabled,
            errorText = state.fieldError(QuestionField.TYPE),
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stringResource(R.string.qb_field_difficulty), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
            SegmentedChoice(
                labels = Difficulty.entries.map { difficultyLabel(it) },
                selectedIndex = state.difficulty?.ordinal ?: -1,
                onSelect = { if (enabled) viewModel.onDifficulty(Difficulty.entries[it]) },
            )
            state.fieldError(QuestionField.DIFFICULTY)?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
            }
        }
        AppTextField(
            value = state.marks,
            onValueChange = viewModel::onMarks,
            label = stringResource(R.string.qb_field_marks),
            kind = FieldKind.Number,
            enabled = enabled,
            errorText = state.fieldError(QuestionField.MARKS),
        )
    }
}

/** Our check first, then the server's line for the same field. */
@Composable
internal fun QuestionFormUiState.fieldError(field: QuestionField): String? =
    errors[field]?.let { stringResource(it) } ?: serverErrors[field]
