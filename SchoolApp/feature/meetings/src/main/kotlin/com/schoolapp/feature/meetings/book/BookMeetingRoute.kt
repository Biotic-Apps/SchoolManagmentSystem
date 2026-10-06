package com.schoolapp.feature.meetings.book

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
internal fun BookMeetingRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: BookMeetingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    BookMeetingScreen(
        state = state,
        onBack = onBack,
        onRetry = viewModel::retry,
        onSlotSelected = viewModel::onSlotSelected,
        onChangeSlot = viewModel::onChangeSlot,
        onAgendaChange = viewModel::onAgendaChange,
        onBook = viewModel::book,
        modifier = modifier,
    )
}
