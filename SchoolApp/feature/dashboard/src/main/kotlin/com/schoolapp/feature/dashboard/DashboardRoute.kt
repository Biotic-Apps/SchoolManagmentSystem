package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun DashboardRoute(
    onOpenMenu: (String) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    DashboardScreen(state = state, onRefresh = viewModel::refresh, onOpenMenu = onOpenMenu, canOpenMenu = canOpenMenu, modifier = modifier)
}
