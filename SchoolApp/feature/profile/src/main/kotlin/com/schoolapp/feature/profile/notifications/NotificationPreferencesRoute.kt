package com.schoolapp.feature.profile.notifications

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun NotificationPreferencesRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NotificationPreferencesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    NotificationPreferencesScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onPushChange = viewModel::onPushChange,
        modifier = modifier,
    )
}
