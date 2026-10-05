package com.schoolapp.feature.home

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.LoadingState

@Composable
fun RoleShellRoute(
    content: ShellContent,
    modifier: Modifier = Modifier,
    viewModel: RoleShellViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when (val current = state) {
        RoleShellUiState.Loading -> LoadingState(modifier.fillMaxSize())
        is RoleShellUiState.Ready -> RoleShellScreen(
            state = current,
            content = content,
            onRoleSelected = viewModel::onRoleSelected,
            onChildSelected = viewModel::onChildSelected,
            onSwitchErrorShown = viewModel::onSwitchErrorShown,
            onLogout = viewModel::onLogout,
            modifier = modifier,
        )
    }
}
