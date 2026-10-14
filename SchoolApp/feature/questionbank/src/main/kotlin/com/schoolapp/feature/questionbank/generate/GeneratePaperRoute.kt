package com.schoolapp.feature.questionbank.generate

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.questionbank.R

/** Generate exam paper: details, sections, then "Generate" opens the new paper. */
@Composable
internal fun GeneratePaperRoute(
    onBack: () -> Unit,
    onGenerated: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: GeneratePaperViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.generatedPaperId) { state.generatedPaperId?.let(onGenerated) }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.qb_generate_paper), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val inner = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(inner)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), inner, onRetry = viewModel::load)
            else -> ScreenColumn(inner) {
                item(key = "intro") { InlineMessage(stringResource(R.string.qb_generate_intro), StatusTone.Info) }
                item(key = "details") { PaperDetailsFields(state, viewModel) }
                item(key = "sections_header") {
                    SectionHeader(
                        title = stringResource(R.string.qb_sections),
                        subtitle = stringResource(R.string.qb_sections_total, state.sectionMarks),
                    )
                }
                itemsIndexed(state.sections, key = { _, s -> "section_${s.key}" }) { index, section ->
                    SectionCard(index, section, state, viewModel)
                }
                item(key = "add_section") {
                    SecondaryButton(stringResource(R.string.qb_add_section), viewModel::addSection, leadingIcon = Icons.Outlined.Add, enabled = !state.isGenerating)
                }
                if (state.marksMismatch) {
                    item(key = "mismatch") {
                        InlineMessage(stringResource(R.string.qb_marks_mismatch, state.sectionMarks, state.totalMarks), StatusTone.Warning)
                    }
                }
                state.generateError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
                item(key = "generate") {
                    PrimaryButton(
                        text = stringResource(R.string.qb_generate),
                        onClick = viewModel::generate,
                        loading = state.isGenerating,
                        leadingIcon = Icons.Outlined.AutoAwesome,
                    )
                }
            }
        }
    }
}

@Composable
private fun PaperDetailsFields(state: GeneratePaperUiState, viewModel: GeneratePaperViewModel) {
    val enabled = !state.isGenerating
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(stringResource(R.string.qb_paper_details))
        CreatablePickerField(
            label = stringResource(R.string.qb_field_subject),
            options = state.catalog.subjects,
            selectedId = state.subjectId,
            onSelect = viewModel::onSubject,
            enabled = enabled,
            errorText = state.error(PaperValidation.SUBJECT),
        )
        CreatablePickerField(
            label = stringResource(R.string.qb_field_class),
            options = state.catalog.classes,
            selectedId = state.classId,
            onSelect = viewModel::onClass,
            enabled = enabled,
            errorText = state.error(PaperValidation.CLASS),
        )
        AppTextField(
            value = state.title,
            onValueChange = viewModel::onTitle,
            label = stringResource(R.string.qb_field_paper_title),
            kind = FieldKind.Title,
            enabled = enabled,
            errorText = state.error(PaperValidation.TITLE),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextField(
                value = state.totalMarks,
                onValueChange = viewModel::onTotalMarks,
                label = stringResource(R.string.qb_field_total_marks),
                kind = FieldKind.Number,
                enabled = enabled,
                errorText = state.error(PaperValidation.TOTAL_MARKS),
                modifier = Modifier.weight(1f),
            )
            AppTextField(
                value = state.duration,
                onValueChange = viewModel::onDuration,
                label = stringResource(R.string.qb_field_duration),
                kind = FieldKind.Number,
                enabled = enabled,
                errorText = state.error(PaperValidation.DURATION_KEY),
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
internal fun GeneratePaperUiState.error(key: String): String? = errors[key]?.let { stringResource(it) }
