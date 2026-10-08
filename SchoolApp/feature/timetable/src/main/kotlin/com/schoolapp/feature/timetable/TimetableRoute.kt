package com.schoolapp.feature.timetable

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.timetable.components.LessonActions

/**
 * [onOpenMenu] / [canOpenMenu] let a teacher jump from a lesson to Attendance or the Diary of their own
 * week; other roles get no quick actions.
 */
@Composable
fun TimetableRoute(
    modifier: Modifier = Modifier,
    viewModel: TimetableViewModel = hiltViewModel(),
    onOpenMenu: (String) -> Unit = {},
    canOpenMenu: (String) -> Boolean = { false },
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val teacherWeek = state.mode == TimetableMode.MY_WEEK && !state.showsSections
    fun action(menuId: String): (() -> Unit)? = if (teacherWeek && canOpenMenu(menuId)) {
        {
            viewModel.onLessonSelected(null)
            onOpenMenu(menuId)
        }
    } else {
        null
    }
    TimetableScreen(
        state = state,
        onDaySelected = viewModel::onDaySelected,
        onSectionSelected = viewModel::onSectionSelected,
        onRetry = viewModel::retry,
        modifier = modifier,
        onTeacherViewSelected = viewModel::onTeacherViewSelected,
        onRefresh = viewModel::refresh,
        onLessonSelected = viewModel::onLessonSelected,
        lessonActions = LessonActions(onMarkAttendance = action(MenuIds.ATTENDANCE), onWriteDiary = action(MenuIds.DIARY)),
    )
}
