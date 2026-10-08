package com.schoolapp.feature.exams.classresults

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Grading
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.classresults.components.StudentResultSheet

/** Staff "Class results" tab: exam + section pickers, the section's results, a sheet per student. */
@Composable
internal fun ClassResultsRoute(
    modifier: Modifier = Modifier,
    viewModel: ClassResultsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val error = state.error
    when {
        state.isLoading -> LoadingState(modifier)
        error != null -> ErrorState(appErrorMessage(error), modifier, onRetry = viewModel::load)
        state.exams.isEmpty() -> EmptyState(
            title = stringResource(R.string.exams_class_results_none),
            message = stringResource(R.string.exams_class_results_none_message),
            modifier = modifier,
            icon = Icons.Outlined.Grading,
        )
        else -> ClassResultsScreen(
            state = state,
            actions = ClassResultsActions(
                onExamSelected = viewModel::onExamSelected,
                onSectionSelected = viewModel::onSectionSelected,
                onRefresh = viewModel::refresh,
                onStudentClick = viewModel::onStudentClick,
            ),
            modifier = modifier,
        )
    }
    state.openResult?.let { result ->
        StudentResultSheet(result = result, examName = state.selectedExam?.name.orEmpty(), onDismiss = viewModel::onSheetDismiss)
    }
}
