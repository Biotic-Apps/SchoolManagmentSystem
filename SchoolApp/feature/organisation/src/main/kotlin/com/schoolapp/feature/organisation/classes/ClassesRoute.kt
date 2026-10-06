package com.schoolapp.feature.organisation.classes

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ClassesRoute(
    modifier: Modifier = Modifier,
    viewModel: ClassesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ClassesScreen(
        state = state,
        onTabSelected = viewModel::onTabSelected,
        onBranchSelected = viewModel::onBranchSelected,
        onRetry = viewModel::load,
        onRefresh = viewModel::refresh,
        modifier = modifier,
    )
}
