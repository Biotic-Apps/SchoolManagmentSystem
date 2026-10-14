package com.schoolapp.feature.timetable.teacherweek

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.TimetableScreen

/** "Teacher week" tab: teacher picker and week navigation above the shared day/week timetable. */
@Composable
fun TeacherWeekRoute(modifier: Modifier = Modifier, viewModel: TeacherWeekViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    TimetableScreen(
        state = state.timetable,
        onDaySelected = viewModel::selectDay,
        onSectionSelected = {},
        onRetry = viewModel::retry,
        modifier = modifier,
        onRefresh = { if (state.staffId == null) viewModel.loadTeachers() else viewModel.refresh() },
        onLessonSelected = viewModel::openLesson,
        topContent = { TeacherWeekBar(state, viewModel) },
    )
}

@Composable
private fun TeacherWeekBar(state: TeacherWeekUiState, viewModel: TeacherWeekViewModel) {
    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Column(
            Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            CreatablePickerField(
                label = stringResource(if (state.teachersLoading) R.string.tt_loading_teachers else R.string.tt_choose_teacher),
                options = state.teachers.map {
                    PickerOption(it.id, it.name, stringResource(R.string.tt_load, it.placedPeriods, it.allocatedPeriods))
                },
                selectedId = state.staffId,
                onSelect = viewModel::selectTeacher,
                enabled = !state.teachersLoading,
            )
            state.teachersError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            state.monday?.let { WeekNavRow(it, state.isThisWeek, viewModel::moveWeek) }
        }
    }
}
