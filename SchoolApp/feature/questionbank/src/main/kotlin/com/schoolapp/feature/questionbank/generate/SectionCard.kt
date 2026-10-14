package com.schoolapp.feature.questionbank.generate

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.common.difficultyLabel
import com.schoolapp.feature.questionbank.common.typeOptions

/** One generator section: title, question type, difficulty, how many questions and marks for each. */
@Composable
internal fun SectionCard(index: Int, section: SectionDraft, state: GeneratePaperUiState, viewModel: GeneratePaperViewModel) {
    val enabled = !state.isGenerating
    val key = { field: String -> PaperValidation.sectionKey(index, field) }
    AppCard(modifier = Modifier.fillMaxWidth(), verticalSpacing = 12.dp, animateSize = false) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = stringResource(R.string.qb_section_number, index + 1, section.marks),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            if (state.sections.size > 1) {
                IconButton(onClick = { viewModel.removeSection(index) }, enabled = enabled) {
                    Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.qb_remove_section), tint = AppColors.Error)
                }
            }
        }
        AppTextField(
            value = section.title,
            onValueChange = { viewModel.onSectionTitle(index, it) },
            label = stringResource(R.string.qb_field_section_title),
            enabled = enabled,
            errorText = state.error(key("title")),
        )
        CreatablePickerField(
            label = stringResource(R.string.qb_field_type),
            options = typeOptions(),
            selectedId = section.type.key,
            onSelect = { viewModel.onSectionType(index, it) },
            enabled = enabled,
        )
        SegmentedChoice(
            labels = Difficulty.entries.map { difficultyLabel(it) },
            selectedIndex = section.difficulty.ordinal,
            onSelect = { if (enabled) viewModel.onSectionDifficulty(index, Difficulty.entries[it]) },
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextField(
                value = section.count,
                onValueChange = { viewModel.onSectionCount(index, it) },
                label = stringResource(R.string.qb_field_question_count),
                kind = FieldKind.Number,
                enabled = enabled,
                errorText = state.error(key("count")),
                modifier = Modifier.weight(1f),
            )
            AppTextField(
                value = section.marksEach,
                onValueChange = { viewModel.onSectionMarks(index, it) },
                label = stringResource(R.string.qb_field_marks_each),
                kind = FieldKind.Number,
                enabled = enabled,
                errorText = state.error(key("marks")),
                modifier = Modifier.weight(1f),
            )
        }
    }
}
