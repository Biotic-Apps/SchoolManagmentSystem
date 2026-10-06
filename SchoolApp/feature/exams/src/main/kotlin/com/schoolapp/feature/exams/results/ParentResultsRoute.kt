package com.schoolapp.feature.exams.results

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.outlined.Grading
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.results.components.ResultCard
import com.schoolapp.feature.exams.results.components.TeacherNoteCard
import com.schoolapp.feature.exams.results.components.TrendCard

@Composable
internal fun ParentResultsRoute(modifier: Modifier = Modifier, viewModel: ParentResultsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(state.openUrl) {
        state.openUrl?.let { url ->
            external.open(url)
            viewModel.onUrlOpened()
        }
    }
    ParentResultsScreen(state, onRetry = viewModel::retry, onReportCard = viewModel::onReportCard, modifier = modifier)
}

@Composable
internal fun ParentResultsScreen(
    state: ParentResultsUiState,
    onRetry: () -> Unit,
    onReportCard: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val error = state.error
    when {
        state.childId == null && !state.isLoading -> EmptyState(
            title = stringResource(R.string.exams_no_child),
            message = stringResource(R.string.exams_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        state.isLoading -> LoadingState(modifier)
        error != null -> ErrorState(appErrorMessage(error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            item(key = "title") {
                SectionHeader(title = stringResource(R.string.exams_results_title), subtitle = state.childName)
            }
            if (state.results.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.exams_no_results),
                        message = stringResource(R.string.exams_no_results_message),
                        icon = Icons.Outlined.Grading,
                    )
                }
            }
            if (state.trend.size >= 2) item(key = "trend") { TrendCard(state.trend) }
            items(state.results, key = { "result_${it.examId}" }) { result ->
                ResultCard(result, state.reportCards[result.examId], onReportCard = { onReportCard(result.examId) })
            }
            item(key = "notes_header") { SectionHeader(title = stringResource(R.string.exams_teacher_notes)) }
            if (state.notes.isEmpty()) {
                item(key = "notes_empty") {
                    Text(stringResource(R.string.exams_no_notes), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
            }
            items(state.notes, key = { "note_${it.id}" }) { note -> TeacherNoteCard(note) }
        }
    }
}
