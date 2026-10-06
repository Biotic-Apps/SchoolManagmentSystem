package com.schoolapp.feature.progress.notes

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
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
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.StudentNotesDestination
import com.schoolapp.feature.progress.components.SectionPicker
import com.schoolapp.feature.progress.components.StudentRow

@Composable
internal fun ProgressStudentsRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProgressStudentsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ProgressStudentsScreen(
        state = state,
        onSectionSelected = viewModel::onSectionSelected,
        onStudentClick = { student ->
            onOpen(StudentNotesDestination(student.id, student.name, student.rollNo))
        },
        onRetry = viewModel::retry,
        onRetryStudents = viewModel::retryStudents,
        modifier = modifier,
    )
}

@Composable
internal fun ProgressStudentsScreen(
    state: ProgressStudentsUiState,
    onSectionSelected: (String) -> Unit,
    onStudentClick: (StudentSummary) -> Unit,
    onRetry: () -> Unit,
    onRetryStudents: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        state.sections.isEmpty() -> EmptyState(
            title = stringResource(R.string.progress_no_sections),
            message = stringResource(R.string.progress_no_sections_message),
            modifier = modifier,
            icon = Icons.Outlined.Groups,
        )
        else -> ScreenColumn(modifier) {
            item(key = "sections") { SectionPicker(state.sections, state.selectedSectionId, onSectionSelected) }
            item(key = "header") { SectionHeader(title = stringResource(R.string.progress_students_header)) }
            when {
                state.isLoadingStudents -> item(key = "loading") { LoadingState() }
                state.studentsError != null -> item(key = "error") {
                    ErrorState(appErrorMessage(state.studentsError), onRetry = onRetryStudents)
                }
                state.students.isEmpty() -> item(key = "empty") {
                    EmptyState(title = stringResource(R.string.progress_no_students), icon = Icons.Outlined.Groups)
                }
                else -> items(state.students, key = { it.id }) { student ->
                    StudentRow(student, onClick = { onStudentClick(student) })
                }
            }
        }
    }
}
