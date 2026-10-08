package com.schoolapp.feature.organisation.branches

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.branches.components.BranchOverviewContent

@Composable
fun BranchDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: BranchDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    BranchDetailScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onRefresh = viewModel::refresh,
        modifier = modifier,
    )
}

@Composable
fun BranchDetailScreen(
    state: BranchDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.overview?.branch?.name ?: stringResource(R.string.org_branch_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        if (state.isLoading) {
            LoadingState(body)
        } else {
            RefreshBox(state.isRefreshing, onRefresh, body.fillMaxSize()) {
                when {
                    state.overview != null -> BranchOverviewContent(state.overview, refreshError = state.error)
                    state.error != null -> PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                }
            }
        }
    }
}
