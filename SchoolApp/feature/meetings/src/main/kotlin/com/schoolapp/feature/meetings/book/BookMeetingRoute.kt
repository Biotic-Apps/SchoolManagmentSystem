package com.schoolapp.feature.meetings.book

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.meeting.MeetingMode

/** Callbacks of the book-a-meeting screen. */
@Immutable
internal data class BookMeetingActions(
    val onBack: () -> Unit,
    val onRetry: () -> Unit,
    val onTeacherSelected: (String) -> Unit,
    val onSlotSelected: (String) -> Unit,
    val onChangeSlot: () -> Unit,
    val onSuggestTime: () -> Unit,
    val onCloseRequest: () -> Unit,
    val onRequestDate: (String) -> Unit,
    val onRequestTime: (String) -> Unit,
    val onRequestMode: (MeetingMode) -> Unit,
    val onAgendaChange: (String) -> Unit,
    val onBook: () -> Unit,
    val onSendRequest: () -> Unit,
)

@Composable
internal fun BookMeetingRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: BookMeetingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val actions = remember(viewModel, onBack) {
        BookMeetingActions(
            onBack = onBack,
            onRetry = viewModel::retry,
            onTeacherSelected = viewModel::onTeacherSelected,
            onSlotSelected = viewModel::onSlotSelected,
            onChangeSlot = viewModel::onChangeSlot,
            onSuggestTime = viewModel::onSuggestTime,
            onCloseRequest = viewModel::onCloseRequest,
            onRequestDate = viewModel::onRequestDate,
            onRequestTime = viewModel::onRequestTime,
            onRequestMode = viewModel::onRequestMode,
            onAgendaChange = viewModel::onAgendaChange,
            onBook = viewModel::book,
            onSendRequest = viewModel::sendRequest,
        )
    }
    BookMeetingScreen(state = state, actions = actions, modifier = modifier)
}
