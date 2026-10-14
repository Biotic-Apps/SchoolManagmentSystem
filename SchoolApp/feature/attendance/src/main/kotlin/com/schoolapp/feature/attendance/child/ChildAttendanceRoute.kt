package com.schoolapp.feature.attendance.child

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.EventNote
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.AttendanceSummaryCard
import com.schoolapp.feature.attendance.components.DayRow
import com.schoolapp.feature.attendance.components.MonthCalendar
import com.schoolapp.feature.attendance.components.MonthHeader
import com.schoolapp.feature.attendance.components.label
import com.schoolapp.feature.attendance.leave.AttendanceLeaveHost

/** Parent: the active child's month (calendar, summary, marked days) and leave requests for that child. */
@Composable
internal fun ChildAttendanceRoute(modifier: Modifier = Modifier, viewModel: ChildAttendanceViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val leaves by viewModel.leavesState.collectAsStateWithLifecycle()
    if (state.childId == null && !state.isLoading) {
        EmptyState(
            title = stringResource(R.string.attendance_no_child),
            message = stringResource(R.string.attendance_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        return
    }
    AttendanceLeaveHost(
        leaves = leaves,
        controller = viewModel.leaves,
        childName = state.childName.orEmpty(),
        canRequest = state.childId != null,
        onRetry = viewModel::retry,
        modifier = modifier,
    ) { contentModifier ->
        ChildAttendanceScreen(state, viewModel::onPreviousMonth, viewModel::onNextMonth, viewModel::retry, contentModifier)
    }
}

@Composable
internal fun ChildAttendanceScreen(
    state: ChildAttendanceUiState,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 96.dp)) {
        item(key = "month") { MonthHeader(state.month, state.canGoNext, onPreviousMonth, onNextMonth) }
        val history = state.history
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            history != null -> {
                item(key = "summary") {
                    AttendanceSummaryCard(stringResource(R.string.attendance_month_summary, state.month.label()), history.summary)
                }
                item(key = "calendar") { MonthCalendar(state.month, state.statusByDate, state.today) }
                item(key = "days_header") { SectionHeader(title = stringResource(R.string.attendance_marked_days)) }
                if (state.markedDays.isEmpty()) {
                    item(key = "days_empty") {
                        EmptyState(title = stringResource(R.string.attendance_no_marks_month), icon = Icons.AutoMirrored.Outlined.EventNote)
                    }
                }
                items(state.markedDays, key = { "day_${it.date}" }) { day ->
                    DayRow(day.date, day.status, listOfNotNull(day.remark?.takeIf { it.isNotBlank() }))
                }
            }
        }
    }
}
