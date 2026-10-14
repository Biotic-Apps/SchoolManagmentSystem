package com.schoolapp.feature.admin.users.form

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.common.TemporaryPasswordCard

@Composable
internal fun CreateUserRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: CreateUserViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var confirmDiscard by rememberSaveable { mutableStateOf(false) }
    val created = state.created
    val password = created?.temporaryPassword
    // Created without a generated password: nothing more to show.
    if (created != null && password == null) {
        LaunchedEffect(created) { onBack() }
    }
    val dirty = state.isDirty && created == null
    BackHandler(enabled = dirty) { confirmDiscard = true }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(if (created == null) R.string.users_add_title else R.string.users_added_title),
                navigationIcon = { BackButton(if (dirty) ({ confirmDiscard = true }) else onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            created != null && password != null -> ScreenColumn(body, maxWidth = AdminFormMaxWidth) {
                item(key = "password") {
                    val user = created.detail.user
                    TemporaryPasswordCard(
                        name = user.name,
                        signIn = user.email ?: user.phone,
                        password = password,
                        title = stringResource(R.string.users_temp_password_for, user.name),
                    )
                }
                item(key = "done") {
                    PrimaryButton(stringResource(R.string.users_done), onBack, Modifier.fillMaxWidth())
                }
            }
            state.isLoading -> LoadingState(body)
            !state.canAdd -> EmptyState(stringResource(R.string.users_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> CreateUserForm(
                state = state,
                actions = CreateUserActions(
                    onContactChange = viewModel::onContactChange,
                    onPasswordChange = viewModel::onPasswordChange,
                    onAssignmentChange = viewModel::onAssignmentChange,
                    onAddAssignment = viewModel::addAssignment,
                    onRemoveAssignment = viewModel::removeAssignment,
                    onSubmit = viewModel::submit,
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
