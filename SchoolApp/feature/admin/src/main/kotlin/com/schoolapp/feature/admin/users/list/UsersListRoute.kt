package com.schoolapp.feature.admin.users.list

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.NoticeSnackbarEffect

@Composable
internal fun UsersListRoute(
    onOpenUser: (String) -> Unit,
    onAddUser: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: UsersListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val notice by viewModel.notice.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    NoticeSnackbarEffect(notice, snackbar, viewModel::consumeNotice)
    Box(modifier.fillMaxSize()) {
        UsersListScreen(
            state = state,
            actions = UsersListActions(
                onQueryChange = viewModel::onQueryChange,
                onRoleChange = viewModel::onRoleChange,
                onBranchChange = viewModel::onBranchChange,
                onStatusChange = viewModel::onStatusChange,
                onReset = viewModel::resetFilters,
                onOpenUser = onOpenUser,
                onRefresh = viewModel::refresh,
                onRetry = viewModel::retry,
                onLoadMore = viewModel::loadMore,
            ),
        )
        if (state.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.users_add),
                icon = Icons.Outlined.PersonAdd,
                onClick = onAddUser,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}
