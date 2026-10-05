package com.schoolapp.feature.profile.sessions

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun DeviceSessionsRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DeviceSessionsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    DeviceSessionsScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onRevoke = viewModel::onRevoke,
        onLogoutAll = viewModel::onLogoutAll,
        modifier = modifier,
    )
}
