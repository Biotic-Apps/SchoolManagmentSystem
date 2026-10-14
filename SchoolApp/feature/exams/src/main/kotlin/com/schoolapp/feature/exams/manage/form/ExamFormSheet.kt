package com.schoolapp.feature.exams.manage.form

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.OptionPickerField
import com.schoolapp.feature.exams.components.examTypeLabel

/** Create ([exam] null) or edit an exam; [onSaved] gets the saved exam. */
@Composable
internal fun ExamFormSheet(
    exam: ExamDetail?,
    onDismiss: () -> Unit,
    onSaved: (ExamDetail) -> Unit,
    viewModel: ExamFormViewModel = hiltViewModel(key = "exam_form_${exam?.id ?: "new"}"),
) {
    val form by viewModel.state.collectAsStateWithLifecycle()
    LaunchedEffect(exam?.id) { viewModel.start(exam) }
    LaunchedEffect(form.saved) {
        form.saved?.let {
            viewModel.onSavedHandled()
            onSaved(it)
        }
    }
    val title = stringResource(if (exam == null) R.string.exams_form_new_title else R.string.exams_form_edit_title)
    AppBottomSheet(title = title, onDismiss = { if (!form.isSaving) onDismiss() }) {
        when {
            form.isLoading -> LoadingState(rows = 3)
            form.loadError != null -> ErrorState(form.loadError?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry)
            else -> ExamFormFields(form, viewModel)
        }
    }
}

@Composable
private fun ExamFormFields(form: ExamFormState, viewModel: ExamFormViewModel) {
    val enabled = !form.isSaving
    form.saveError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
    AppTextField(
        value = form.name,
        onValueChange = viewModel::onName,
        label = stringResource(R.string.exams_form_name),
        enabled = enabled,
        errorText = if (form.errors.name) stringResource(R.string.exams_form_name_required) else null,
    )
    OptionPickerField(
        label = stringResource(R.string.exams_form_type),
        options = ExamType.entries.map { SwitcherOption(it.name, examTypeLabel(it)) },
        selectedId = form.type.name,
        onSelect = { viewModel.onType(ExamType.valueOf(it)) },
        enabled = enabled,
    )
    OptionPickerField(
        label = stringResource(R.string.exams_form_session),
        options = form.sessions.map { SwitcherOption(it.id, it.name) },
        selectedId = form.sessionId,
        onSelect = viewModel::onSession,
        enabled = enabled && !form.isEdit,
        errorText = if (form.errors.session) stringResource(R.string.exams_form_session_required) else null,
    )
    if (form.terms.isNotEmpty()) {
        val noTerm = SwitcherOption(NO_TERM, stringResource(R.string.exams_form_no_term))
        OptionPickerField(
            label = stringResource(R.string.exams_form_term),
            options = listOf(noTerm) + form.terms.mapNotNull { term -> term.id?.let { SwitcherOption(it, term.name) } },
            selectedId = form.termId ?: NO_TERM,
            onSelect = { viewModel.onTerm(it.takeIf { id -> id != NO_TERM }) },
            enabled = enabled,
        )
    }
    if (!form.schemesLoading && form.sessionId != null && form.schemes.isEmpty()) {
        InlineMessage(stringResource(R.string.exams_form_no_schemes), StatusTone.Warning)
    } else {
        OptionPickerField(
            label = stringResource(R.string.exams_form_scheme),
            options = form.schemes.map { SwitcherOption(it.id, it.name) },
            selectedId = form.schemeId,
            onSelect = viewModel::onScheme,
            enabled = enabled && !form.schemesLoading,
            errorText = if (form.errors.scheme) stringResource(R.string.exams_form_scheme_required) else null,
        )
    }
    AppTextField(
        value = form.weight,
        onValueChange = viewModel::onWeight,
        label = stringResource(R.string.exams_form_weight),
        kind = FieldKind.Number,
        enabled = enabled,
        errorText = if (form.errors.weight) stringResource(R.string.exams_form_weight_invalid) else null,
    )
    ClassChecklist(form, enabled, viewModel::toggleClass, viewModel::setAllClasses)
    if (form.errors.classes) {
        Text(stringResource(R.string.exams_form_classes_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
    }
    PrimaryButton(
        text = stringResource(if (form.isEdit) R.string.exams_form_save else R.string.exams_form_create),
        onClick = viewModel::save,
        loading = form.isSaving,
        modifier = Modifier.fillMaxWidth(),
    )
}

private const val NO_TERM = "none"
