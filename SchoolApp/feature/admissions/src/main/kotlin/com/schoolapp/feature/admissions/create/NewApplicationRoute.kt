package com.schoolapp.feature.admissions.create

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.people.ChildFields
import com.schoolapp.core.ui.people.GuardianFields
import com.schoolapp.core.ui.people.MAX_GUARDIANS
import com.schoolapp.core.ui.people.text
import com.schoolapp.feature.admissions.R

/** [onCreated] gets the new application's id (the caller opens its detail). */
@Composable
fun NewApplicationRoute(
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NewApplicationViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.createdId) { state.createdId?.let(onCreated) }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.admissions_new_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            !state.canAdd -> EmptyState(stringResource(R.string.admissions_new_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> ApplicationForm(state, viewModel, body)
        }
    }
}

@Composable
private fun ApplicationForm(state: NewApplicationUiState, viewModel: NewApplicationViewModel, modifier: Modifier) {
    ScreenColumn(modifier) {
        if (state.noSession) item { InlineMessage(stringResource(R.string.admissions_new_no_session), StatusTone.Warning) }
        item {
            Card(stringResource(R.string.admissions_new_class)) {
                CreatablePickerField(
                    label = stringResource(R.string.admissions_new_class_field),
                    options = state.classes.map { PickerOption(it.id, it.name) },
                    selectedId = state.classId,
                    onSelect = { it?.let(viewModel::onClass) },
                    errorText = state.errors.text(NewApplicationViewModel.CLASS),
                )
            }
        }
        item { Card(stringResource(R.string.admissions_new_child)) { ChildFields(state.child, state.errors, viewModel::onChildChange, state.today) } }
        state.guardians.forEachIndexed { index, guardian ->
            item(key = "g$index") {
                AppCard(Modifier.fillMaxWidth()) {
                    GuardianFields(
                        form = guardian,
                        errors = state.errors,
                        prefix = "guardians.$index.",
                        onChange = { viewModel.onGuardianChange(index, it) },
                        title = stringResource(R.string.admissions_new_guardian_n, index + 1),
                        onMakePrimary = { viewModel.makePrimary(index) },
                        onRemove = if (state.guardians.size > 1) ({ viewModel.removeGuardian(index) }) else null,
                    )
                }
            }
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (state.guardians.size < MAX_GUARDIANS) {
                    SecondaryButton(stringResource(R.string.admissions_new_add_guardian), onClick = viewModel::addGuardian, leadingIcon = Icons.Outlined.Add)
                }
                AppTextField(
                    value = state.notes,
                    onValueChange = viewModel::onNotes,
                    label = stringResource(R.string.admissions_new_notes),
                    singleLine = false,
                    minLines = 2,
                    kind = FieldKind.Sentence,
                    supportingText = stringResource(R.string.admissions_new_optional),
                )
                state.submitError?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
                if (!state.errors.isEmpty) InlineMessage(stringResource(R.string.admissions_new_fix_fields), StatusTone.Error)
                PrimaryButton(
                    stringResource(R.string.admissions_new_submit),
                    onClick = viewModel::submit,
                    loading = state.submitting,
                    enabled = !state.noSession,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
private fun Card(title: String, content: @Composable () -> Unit) {
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(title = title)
        content()
    }
}
