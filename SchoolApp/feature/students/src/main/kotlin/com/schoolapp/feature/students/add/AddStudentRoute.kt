package com.schoolapp.feature.students.add

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
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
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
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.core.ui.people.GuardianFields
import com.schoolapp.core.ui.people.MAX_GUARDIANS
import com.schoolapp.core.ui.people.text
import com.schoolapp.feature.students.R

/** [onCreated] gets the new student's id (the caller opens the profile). */
@Composable
fun AddStudentRoute(
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AddStudentViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.created) { state.created?.let { onCreated(it.id) } }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.students_add_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            !state.canAdd -> EmptyState(stringResource(R.string.students_add_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> AddStudentForm(state, viewModel, body)
        }
    }
}

@Composable
private fun AddStudentForm(state: AddStudentUiState, viewModel: AddStudentViewModel, modifier: Modifier) {
    ScreenColumn(modifier) {
        item {
            FormCard(stringResource(R.string.students_add_child)) {
                ChildFields(state.child, state.errors, viewModel::onChildChange, state.today)
            }
        }
        item {
            FormCard(stringResource(R.string.students_add_class)) {
                CreatablePickerField(
                    label = stringResource(R.string.students_add_section),
                    options = state.sections.map { section ->
                        val seats = section.capacity?.let { stringResource(R.string.students_seats, section.studentCount, it) }
                        PickerOption(section.id, section.label, listOfNotNull(seats, stringResource(R.string.students_full).takeIf { section.isFull }).joinToString(" · "), muted = section.isFull)
                    },
                    selectedId = state.sectionId,
                    onSelect = { it?.let(viewModel::onSectionChange) },
                    errorText = state.errors.text(AddStudentViewModel.SECTION),
                )
                if (state.sections.isEmpty()) InlineMessage(stringResource(R.string.students_add_no_sections), StatusTone.Warning)
                DateField(
                    stringResource(R.string.students_admission_date), state.admissionDate, viewModel::onAdmissionDateChange,
                    state.errors.text(AddStudentViewModel.ADMISSION_DATE),
                )
                InlineMessage(stringResource(R.string.students_add_numbers_hint), StatusTone.Info)
            }
        }
        state.guardians.forEachIndexed { index, guardian ->
            item(key = "g$index") {
                AppCard(Modifier.fillMaxWidth()) {
                    GuardianFields(
                        form = guardian,
                        errors = state.errors,
                        prefix = "guardians.$index.",
                        onChange = { viewModel.onGuardianChange(index, it) },
                        title = stringResource(R.string.students_guardian_n, index + 1),
                        onMakePrimary = { viewModel.makePrimary(index) },
                        onRemove = if (state.guardians.size > 1) ({ viewModel.removeGuardian(index) }) else null,
                    )
                }
            }
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (state.guardians.size < MAX_GUARDIANS) {
                    SecondaryButton(stringResource(R.string.students_add_another_guardian), onClick = viewModel::addGuardian, leadingIcon = Icons.Outlined.Add)
                }
                state.submitError?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
                if (!state.errors.isEmpty) {
                    val count = state.errors.problems.size + state.errors.server.size
                    InlineMessage(pluralStringResource(R.plurals.students_fix_fields, count, count), StatusTone.Error)
                }
                PrimaryButton(stringResource(R.string.students_register), onClick = viewModel::submit, loading = state.submitting, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
internal fun FormCard(title: String, content: @Composable () -> Unit) {
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(title = title)
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { content() }
    }
}
