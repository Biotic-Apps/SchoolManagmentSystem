package com.schoolapp.feature.meetings.staff.schedule

import android.widget.Toast
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.meetings.R

/** Full-screen "Schedule meeting"; on success shows a toast and opens the new meeting. */
@Composable
internal fun ScheduleMeetingRoute(
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ScheduleMeetingViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scheduled = stringResource(R.string.meetings_scheduled)
    LaunchedEffect(state.createdId) {
        state.createdId?.let {
            viewModel.onNavigated()
            Toast.makeText(context, scheduled, Toast.LENGTH_SHORT).show()
            onCreated(it)
        }
    }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.meetings_schedule), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        ScheduleMeetingScreen(
            state = state,
            actions = ScheduleMeetingActions(
                onQueryChange = viewModel::onQueryChange,
                onStudentSelected = viewModel::onStudentSelected,
                onClearStudent = viewModel::onClearStudent,
                onGuardianSelected = viewModel::onGuardianSelected,
                onRetryGuardians = viewModel::retryGuardians,
                onTimeChange = viewModel::onTimeChange,
                onAgendaChange = viewModel::onAgendaChange,
                onSubmit = viewModel::submit,
            ),
            modifier = Modifier.padding(padding),
        )
    }
}
