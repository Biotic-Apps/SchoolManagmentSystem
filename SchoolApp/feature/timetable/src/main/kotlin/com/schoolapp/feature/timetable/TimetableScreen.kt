package com.schoolapp.feature.timetable

import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.timetable.components.LessonActions
import com.schoolapp.feature.timetable.components.LessonSheet
import com.schoolapp.feature.timetable.components.ScrollableState
import com.schoolapp.feature.timetable.components.TeacherViewSwitch
import com.schoolapp.feature.timetable.components.TimetableStatusState
import com.schoolapp.feature.timetable.components.WeekContent
import java.time.LocalDate

/**
 * Read-only timetable for every role: optional "My week / My sections" switch and section chips, then
 * the week (day chips + swipeable day timeline, or a week grid on wide screens), pull-to-refresh, and a
 * lesson sheet with the role's quick actions.
 */
@Composable
fun TimetableScreen(
    state: TimetableUiState,
    onDaySelected: (Int) -> Unit,
    onSectionSelected: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
    onTeacherViewSelected: (TeacherView) -> Unit = {},
    onRefresh: () -> Unit = onRetry,
    onLessonSelected: (ScheduleRow?) -> Unit = {},
    lessonActions: LessonActions = LessonActions(),
) {
    var weekLayout by rememberSaveable { mutableStateOf(false) }
    Column(modifier.fillMaxSize()) {
        state.teacherView?.let {
            TeacherViewSwitch(it, onTeacherViewSelected, Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        }
        if (state.showsSections && state.sections.isNotEmpty()) {
            FilterChipRow(
                options = state.sections,
                selectedId = state.selectedSectionId,
                onSelect = onSectionSelected,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }
        state.subtitle?.takeIf { !state.showsSections }?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary, modifier = Modifier.padding(16.dp, 4.dp))
        }
        when {
            state.isLoading -> LoadingState()
            state.error != null && !state.hasWeek -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
            else -> RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxWidth().weight(1f)) {
                if (!state.hasWeek) {
                    ScrollableState { TimetableStatusState(state) }
                } else {
                    BoxWithConstraints(Modifier.fillMaxSize()) {
                        WeekContent(
                            state = state,
                            wide = maxWidth >= WideWidth,
                            weekLayout = weekLayout,
                            onWeekLayout = { weekLayout = it },
                            onDaySelected = onDaySelected,
                            onOpen = { onLessonSelected(it) },
                        )
                    }
                }
            }
        }
    }
    state.openLesson?.let { LessonSheet(it, lessonActions, onDismiss = { onLessonSelected(null) }) }
}

private val WideWidth = 600.dp

@Preview(showBackground = true, widthDp = 360, heightDp = 720)
@Composable
private fun TimetableScreenPreview() = SchoolTheme {
    val monday = LocalDate.of(2026, 10, 5)
    val rows = listOf(
        ScheduleRow(1, 1, "08:00", "08:40", "8:00 – 8:40 AM", "Mathematics", "Class 5 · A", "Room 12", periodNumber = 1),
        ScheduleRow(1, 2, "08:40", "09:20", "8:40 – 9:20 AM", "", null, null, kind = RowKind.FREE, periodNumber = 2),
        ScheduleRow(1, 3, "09:20", "09:40", "9:20 – 9:40 AM", "Break", null, null, kind = RowKind.BREAK),
        ScheduleRow(1, 4, "09:40", "10:20", "9:40 – 10:20 AM", "English", "Class 6 · B", null, isSubstitute = true, periodNumber = 3),
    )
    TimetableScreen(
        state = TimetableUiState(
            isLoading = false,
            teacherView = TeacherView.WEEK,
            days = (1..6).map { DayPlan(it, monday.plusDays(it - 1L), if (it == 1) rows else emptyList()) },
            selectedDay = 1,
            today = 1,
            markers = mapOf(rows[0].key to RowMarker.NOW, rows[3].key to RowMarker.NEXT),
        ),
        onDaySelected = {}, onSectionSelected = {}, onRetry = {},
    )
}
