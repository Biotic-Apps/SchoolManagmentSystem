package com.schoolapp.feature.admin.users.form

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Save
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth

@Composable
internal fun EditUserRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: EditUserViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var confirmDiscard by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(state.saved) { if (state.saved) onBack() }
    val dirty = state.isDirty && !state.saved
    BackHandler(enabled = dirty) { confirmDiscard = true }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.users_edit_title),
                navigationIcon = { BackButton(if (dirty) ({ confirmDiscard = true }) else onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            !state.canEdit -> EmptyState(stringResource(R.string.users_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> ScreenColumn(body, maxWidth = AdminFormMaxWidth) {
                item(key = "fields") {
                    AppCard(Modifier.fillMaxWidth()) {
                        UserContactFields(state.contact, viewModel::onContactChange, state.errors, state.serverErrors)
                    }
                }
                state.saveError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
                item(key = "save") {
                    PrimaryButton(
                        text = stringResource(R.string.admin_save_changes),
                        onClick = viewModel::save,
                        loading = state.isSaving,
                        enabled = !state.isSaving,
                        leadingIcon = Icons.Outlined.Save,
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                    )
                }
            }
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
