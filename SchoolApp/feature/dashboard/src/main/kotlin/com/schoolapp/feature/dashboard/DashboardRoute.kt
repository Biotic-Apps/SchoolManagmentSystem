package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

/** Role home; [onOpen] navigates to cross-module destinations (registers, diary editor, notices, ...). */
@Composable
fun DashboardRoute(
    onOpenMenu: (String) -> Unit,
    canOpenMenu: (String) -> Boolean,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    DashboardScreen(
        state = state,
        onRefresh = viewModel::refresh,
        onOpenMenu = onOpenMenu,
        onOpen = onOpen,
        canOpenMenu = canOpenMenu,
        modifier = modifier,
    )
}
