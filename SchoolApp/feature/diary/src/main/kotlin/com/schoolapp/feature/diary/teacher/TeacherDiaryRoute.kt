package com.schoolapp.feature.diary.teacher

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
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
import com.schoolapp.core.navigation.DiaryEditorDestination
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.components.DateNavigator
import com.schoolapp.feature.diary.components.DiaryResultMessage

@Composable
internal fun TeacherDiaryRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: TeacherDiaryViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    TeacherDiaryContent(
        state = state,
        onPreviousDay = viewModel::onPreviousDay,
        onNextDay = viewModel::onNextDay,
        onDateSelected = viewModel::onDateSelected,
        onRetry = viewModel::load,
        onOpenEditor = { section, subjectId -> onOpen(DiaryEditorDestination(section.sectionId, state.date, subjectId, section.title)) },
        modifier = modifier,
    )
}

@Composable
internal fun TeacherDiaryContent(
    state: TeacherDiaryUiState,
    onPreviousDay: () -> Unit,
    onNextDay: () -> Unit,
    onDateSelected: (String) -> Unit,
    onRetry: () -> Unit,
    onOpenEditor: (SectionDiary, String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier) {
        item(key = "date") { DateNavigator(state.date, state.today, onPreviousDay, onNextDay, onDateSelected) }
        state.message?.let { message -> item(key = "message") { DiaryResultMessage(message) } }
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            state.sections.isEmpty() -> item(key = "empty") {
                EmptyState(
                    stringResource(R.string.diary_no_sections),
                    message = stringResource(R.string.diary_no_sections_message),
                    icon = Icons.AutoMirrored.Outlined.MenuBook,
                )
            }
            else -> items(state.sections.size, key = { state.sections[it].sectionId }) { index ->
                val section = state.sections[index]
                SectionDiaryCard(
                    section = section,
                    onAdd = { onOpenEditor(section, null) },
                    onOpenRow = { row -> onOpenEditor(section, row.subjectId) },
                )
            }
        }
    }
}
