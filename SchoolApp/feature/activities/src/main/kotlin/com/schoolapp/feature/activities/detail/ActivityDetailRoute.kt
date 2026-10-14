package com.schoolapp.feature.activities.detail

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
internal fun ActivityDetailRoute(
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onEditParticipants: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ActivityDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onResume() }
    val actions = remember(viewModel) {
        ActivityDetailActions(
            onBack = onBack,
            onRetry = viewModel::load,
            onConsentNoteChange = viewModel::onConsentNoteChange,
            onDecideConsent = viewModel::decideConsent,
            onApprovalCommentChange = viewModel::onApprovalCommentChange,
            onApprove = viewModel::approve,
            onReject = viewModel::reject,
            onEdit = { viewModel.uiState.value.activity?.id?.let(onEdit) },
            onEditParticipants = { viewModel.uiState.value.activity?.id?.let(onEditParticipants) },
            status = viewModel.status,
        )
    }
    ActivityDetailScreen(state = state, actions = actions, modifier = modifier)
}
