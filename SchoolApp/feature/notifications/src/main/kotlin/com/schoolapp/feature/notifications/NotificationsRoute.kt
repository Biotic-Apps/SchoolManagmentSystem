package com.schoolapp.feature.notifications

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun NotificationsRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NotificationsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    NotificationsScreen(
        state = state,
        onBack = onBack,
        onRefresh = viewModel::refresh,
        onUnreadOnlyChange = viewModel::onUnreadOnlyChange,
        onOpen = viewModel::onOpen,
        onMarkAllRead = viewModel::onMarkAllRead,
        modifier = modifier,
    )
}
