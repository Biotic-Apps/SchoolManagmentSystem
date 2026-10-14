package com.schoolapp.feature.admin.roles.editor

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admin.R

@Composable
internal fun RoleEditorRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: RoleEditorViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var confirmDiscard by rememberSaveable { mutableStateOf(false) }
    val guardedBack: () -> Unit = {
        if (state.isDirty && !state.rights.readOnly) {
            confirmDiscard = true
        } else {
            onBack()
        }
    }
    LaunchedEffect(state.done) { if (state.done) onBack() }
    BackHandler(enabled = state.isDirty && !state.done) { guardedBack() }

    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = editorTitle(state),
                subtitle = if (state.role?.isSystem == true) stringResource(R.string.roles_type_system_role) else null,
                navigationIcon = { BackButton(guardedBack) },
            )
        },
    ) { padding ->
        val inner = Modifier.padding(padding)
        val loadError = state.loadError
        when {
            state.isLoading -> LoadingState(inner)
            loadError != null -> ErrorState(appErrorMessage(loadError), inner, onRetry = viewModel::load)
            else -> RoleEditorContent(
                state = state,
                callbacks = RoleEditorCallbacks(
                    onNameChange = viewModel::onNameChange,
                    onSchoolChange = viewModel::onSchoolChange,
                    onModuleQueryChange = viewModel::onModuleQueryChange,
                    onToggle = viewModel::toggle,
                    onToggleRow = viewModel::toggleRow,
                    onToggleColumn = viewModel::toggleColumn,
                    onSave = viewModel::save,
                ),
                modifier = inner,
            )
        }
    }
    if (confirmDiscard) {
        ConfirmDialog(
            title = stringResource(R.string.roles_discard_title),
            message = stringResource(R.string.roles_discard_message),
            confirmLabel = stringResource(R.string.roles_discard_confirm),
            onConfirm = {
                confirmDiscard = false
                onBack()
            },
            onDismiss = { confirmDiscard = false },
            destructive = true,
        )
    }
}

@Composable
private fun editorTitle(state: RoleEditorUiState): String {
    val role = state.role
    return when {
        state.isNew -> stringResource(R.string.roles_create_title)
        role == null -> stringResource(R.string.roles_title)
        state.rights.readOnly -> role.name
        else -> stringResource(R.string.roles_edit_title, role.name)
    }
}
