package com.schoolapp.feature.admin.schools.edit

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
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
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R

@Composable
internal fun SchoolEditRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SchoolEditViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var confirmDiscard by rememberSaveable { mutableStateOf(false) }
    val leave = { if (state.isDirty && !state.saved) confirmDiscard = true else onBack() }
    LaunchedEffect(state.saved) { if (state.saved) onBack() }
    BackHandler(enabled = state.isDirty && !state.saved) { confirmDiscard = true }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.schools_edit_title), navigationIcon = { BackButton(leave) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            !state.canEdit -> EmptyState(stringResource(R.string.schools_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> SchoolEditForm(
                state = state,
                actions = SchoolEditActions(
                    onFormChange = viewModel::onFormChange,
                    onLogoPicked = viewModel::onLogoPicked,
                    onRemoveLogo = viewModel::onRemoveLogo,
                    onSave = viewModel::save,
                ),
                modifier = body,
            )
        }
    }
    if (confirmDiscard) {
        ConfirmDialog(
            title = stringResource(R.string.admin_discard_title),
            message = stringResource(R.string.admin_discard_message),
            confirmLabel = stringResource(R.string.admin_discard),
            onConfirm = {
                confirmDiscard = false
                onBack()
            },
            onDismiss = { confirmDiscard = false },
            destructive = true,
        )
    }
}
