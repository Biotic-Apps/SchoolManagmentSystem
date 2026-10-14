package com.schoolapp.feature.students.detail.pickup

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DirectionsWalk
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R

/** Pickup tab (web PickupPersonsTab): only verified persons may collect; guardians on record always can. */
@Composable
internal fun StudentPickupTab(studentId: String, canEdit: Boolean, snackbar: SnackbarHostState, modifier: Modifier = Modifier) {
    val viewModel: StudentPickupViewModel = hiltViewModel()
    LaunchedEffect(studentId) { viewModel.start(studentId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val context = LocalContext.current
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { action ->
            snackbar.showSnackbar(context.getString(if (action == PickupAction.VERIFY) R.string.sd_pickup_verified else R.string.sd_pickup_revoked))
        }
    }
    val actionMessage = state.actionError?.let { actionErrorMessage(it) }
    LaunchedEffect(actionMessage) {
        actionMessage ?: return@LaunchedEffect
        viewModel.consumeActionError()
        snackbar.showSnackbar(actionMessage)
    }
    val error = state.error
    when {
        state.isLoading -> LoadingState(modifier)
        error != null && state.persons.isEmpty() -> ErrorState(loadErrorMessage(error), modifier, onRetry = { viewModel.load() })
        else -> RefreshBox(state.isRefreshing, { viewModel.load(refresh = true) }, modifier.fillMaxSize()) {
            if (state.persons.isEmpty()) {
                PullableState {
                    EmptyState(
                        title = stringResource(R.string.sd_pickup_empty_title),
                        message = stringResource(R.string.sd_pickup_hint),
                        icon = Icons.Outlined.DirectionsWalk,
                    )
                }
            } else {
                ScreenColumn {
                    item(key = "hint") {
                        Text(stringResource(R.string.sd_pickup_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                    items(state.persons.size, key = { state.persons[it].id }) { index ->
                        val person = state.persons[index]
                        PickupPersonCard(person, external::dial, if (canEdit) ({ action -> viewModel.ask(person, action) }) else null)
                    }
                }
            }
        }
    }
    state.confirm?.let { PickupConfirmDialog(it, viewModel::confirm, viewModel::dismiss) }
}

@Composable
private fun PickupConfirmDialog(confirm: PickupConfirm, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    val verify = confirm.action == PickupAction.VERIFY
    ConfirmDialog(
        title = stringResource(if (verify) R.string.sd_pickup_verify_title else R.string.sd_pickup_revoke_title),
        message = stringResource(if (verify) R.string.sd_pickup_verify_message else R.string.sd_pickup_revoke_message, confirm.person.name),
        confirmLabel = stringResource(if (verify) R.string.sd_pickup_verify else R.string.sd_pickup_revoke),
        onConfirm = onConfirm,
        onDismiss = onDismiss,
        destructive = !verify,
    )
}
