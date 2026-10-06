package com.schoolapp.feature.meetings.parent

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
internal fun ParentMeetingsRoute(
    onBook: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ParentMeetingsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onResume() }
    ParentMeetingsScreen(state, onBook = onBook, onRefresh = viewModel::refresh, onRetry = viewModel::retry, modifier = modifier)
}
