package com.schoolapp.feature.organisation.sessions

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun SessionsCalendarRoute(
    modifier: Modifier = Modifier,
    viewModel: SessionsCalendarViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SessionsCalendarScreen(
        state = state,
        onBranchSelected = viewModel::onBranchSelected,
        onRetry = viewModel::load,
        onRefresh = viewModel::refresh,
        modifier = modifier,
    )
}
