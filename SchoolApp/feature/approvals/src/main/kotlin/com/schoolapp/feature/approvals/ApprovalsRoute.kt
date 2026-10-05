package com.schoolapp.feature.approvals

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ApprovalsRoute(
    onOpen: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ApprovalsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ApprovalsScreen(
        state = state,
        onFilterSelected = viewModel::onFilterSelected,
        onRefresh = viewModel::refresh,
        onOpen = onOpen,
        modifier = modifier,
    )
}
