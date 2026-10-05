package com.schoolapp.feature.approvals.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ApprovalDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ApprovalDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ApprovalDetailScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onCommentChange = viewModel::onCommentChange,
        onDecide = viewModel::onDecide,
        modifier = modifier,
    )
}
