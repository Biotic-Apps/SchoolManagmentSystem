package com.schoolapp.feature.organisation.branches

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
    BranchDetailScreen(state = state, onBack = onBack, onRetry = viewModel::load, modifier = modifier)
}

@Composable
fun BranchDetailScreen(
    state: BranchDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
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
        when {
            state.isLoading -> LoadingState(body)
            state.error != null -> ErrorState(appErrorMessage(state.error), body, onRetry = onRetry)
            state.overview != null -> BranchOverviewContent(state.overview, body)
        }
    }
}
