package com.schoolapp.feature.pickup.gate

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.pickup.RecordDepartureDestination

/** Gate desk (with `pickup.edit`) or a read-only view of today's early leaves and departures. */
@Composable
internal fun GateRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: GateViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleResumeEffect(Unit) {
        viewModel.refresh()
        onPauseOrDispose { }
    }
    val error = state.error
    when {
        state.isLoading -> LoadingState(modifier)
        // A failed background refresh keeps today's lists on screen (with a banner) instead of swapping them out.
        error != null && state.earlyLeaves.isEmpty() && state.departures.isEmpty() ->
            ErrorState(loadErrorMessage(error), modifier, onRetry = viewModel::refresh)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = viewModel::refresh, modifier = modifier) {
            GateContent(
                state = state,
                onRecordDeparture = { studentId, studentName, leave ->
                    onOpen(RecordDepartureDestination(studentId, studentName, leave?.id, leave?.time))
                },
                onApprove = viewModel::approve,
                onReject = viewModel::reject,
                onQueryChange = viewModel::onQueryChange,
                onDateChange = viewModel::onDateChange,
            )
        }
    }
}
