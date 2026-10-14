package com.schoolapp.feature.admin.roles.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.admin.R

/** Roles & Permissions list; [onOpenRole] gets the role id, or null to create a custom role. */
@Composable
internal fun RolesListRoute(
    onOpenRole: (String?) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: RolesListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val message = state.message?.let { stringResource(it) } ?: state.actionError?.let { actionErrorMessage(it) }
    LaunchedEffect(message) {
        if (message != null) {
            viewModel.messageShown()
            snackbar.showSnackbar(message)
        }
    }
    Box(modifier.fillMaxSize()) {
        RolesListScreen(
            state = state,
            callbacks = RolesListCallbacks(
                onQueryChange = viewModel::onQueryChange,
                onOpen = { onOpenRole(it.id) },
                onDelete = viewModel::askDelete,
                onRetry = viewModel::retry,
                onRefresh = viewModel::refresh,
            ),
            bottomPadding = if (state.canAdd) FAB_CLEARANCE else 16.dp,
        )
        if (state.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.roles_create),
                icon = Icons.Outlined.Add,
                onClick = { onOpenRole(null) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(bottom = if (state.canAdd) 72.dp else 0.dp))
    }
    state.deleteTarget?.let { role ->
        ConfirmDialog(
            title = stringResource(R.string.roles_delete_title, role.name),
            message = stringResource(R.string.roles_delete_message),
            confirmLabel = stringResource(if (state.isDeleting) R.string.roles_deleting else R.string.roles_delete_confirm),
            onConfirm = { if (!state.isDeleting) viewModel.confirmDelete() },
            onDismiss = viewModel::dismissDelete,
            destructive = true,
        )
    }
}

/** Keeps the last row clear of the "Create role" button. */
private val FAB_CLEARANCE = 88.dp
