package com.schoolapp.feature.activities.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
internal fun ActivityDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ActivityDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ActivityDetailScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onConsentNoteChange = viewModel::onConsentNoteChange,
        onDecideConsent = viewModel::decideConsent,
        onApprovalCommentChange = viewModel::onApprovalCommentChange,
        onApprove = viewModel::approve,
        onReject = viewModel::reject,
        modifier = modifier,
    )
}
