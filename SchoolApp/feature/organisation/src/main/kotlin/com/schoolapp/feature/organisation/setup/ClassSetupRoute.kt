package com.schoolapp.feature.organisation.setup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SaveIndicator
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.setup.components.SectionsCard
import com.schoolapp.feature.organisation.setup.components.SubjectsCard
import com.schoolapp.feature.organisation.setup.components.TeachersCard

/** [onOpenTimetable] opens the timetable builder for a section of this class (null when the role can't). */
@Composable
fun ClassSetupRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onOpenTimetable: ((sectionId: String, title: String) -> Unit)? = null,
    viewModel: ClassSetupViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.setup?.className ?: stringResource(R.string.org_setup_title),
                navigationIcon = { BackButton(onBack) },
                actions = {
                    SaveIndicator(state.saveStatus, Modifier.padding(end = 4.dp))
                    if (state.rights.editStructure && state.nameDraft == null && state.setup != null) {
                        IconButton(onClick = viewModel::startRename) {
                            Icon(Icons.Outlined.Edit, contentDescription = stringResource(R.string.org_rename_class))
                        }
                    }
                },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.setup == null -> ErrorState(appErrorMessage(state.loadError ?: AppError.Unknown()), body, onRetry = viewModel::load)
            else -> ScreenColumn(body, contentPadding = PaddingValues(16.dp)) {
                item { Header(state, viewModel, onOpenTimetable) }
                item { SectionsCard(state, viewModel.sections, viewModel::revealGroups) }
                item { SubjectsCard(state, viewModel.curriculum, viewModel::dismissSubjectError) }
                item { TeachersCard(state, viewModel.teachers) }
            }
        }
    }
    state.removeSection?.let { section ->
        ConfirmDialog(
            title = stringResource(R.string.org_remove_section_title, section.name),
            message = state.removeError?.let { actionErrorMessage(it.error, it.details) } ?: stringResource(R.string.org_remove_section_message),
            confirmLabel = stringResource(R.string.org_remove),
            onConfirm = viewModel.sections::confirmRemove,
            onDismiss = viewModel.sections::dismissRemove,
            destructive = true,
        )
    }
}

@Composable
private fun Header(state: ClassSetupUiState, viewModel: ClassSetupViewModel, onOpenTimetable: ((String, String) -> Unit)?) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        state.nameDraft?.let { draft ->
            AppCard(Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AppTextField(
                        value = draft,
                        onValueChange = viewModel::onNameDraftChange,
                        label = stringResource(R.string.org_class_name),
                        kind = FieldKind.Title,
                        imeAction = ImeAction.Done,
                        onImeAction = viewModel::saveRename,
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = viewModel::cancelRename) { Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.org_cancel)) }
                }
                AppTextButton(stringResource(R.string.org_save), onClick = viewModel::saveRename)
            }
        }
        state.banner?.let {
            Row(verticalAlignment = Alignment.CenterVertically) {
                InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error, Modifier.weight(1f))
                IconButton(onClick = viewModel::dismissBanner) { Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.org_dismiss)) }
            }
        }
        val first = state.sections.firstOrNull()
        if (onOpenTimetable != null && first != null) {
            AppTextButton(
                stringResource(R.string.org_open_timetable),
                onClick = { onOpenTimetable(first.id, "${state.setup?.className} ${first.name}") },
                leadingIcon = Icons.Outlined.CalendarMonth,
            )
        }
    }
}
