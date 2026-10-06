package com.schoolapp.feature.organisation.branches

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.feature.organisation.sessions.SessionsCalendarRoute

@Composable
fun BranchesRoute(
    onOpenBranch: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: BranchesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    BranchesScreen(
        state = state,
        onRetry = viewModel::load,
        onRefresh = viewModel::refresh,
        onOpenBranch = onOpenBranch,
        modifier = modifier,
        calendarContent = { SessionsCalendarRoute() },
    )
}
